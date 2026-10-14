import base64
import importlib.util
import json
import queue
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


class LiveTranslateTests(unittest.TestCase):
    def setUp(self):
        self.output = Mock()
        self.commands = Mock()
        self.errors = Mock()
        self.shared = types.SimpleNamespace(status='running', chunk_queue=queue.Queue())
        utils = types.ModuleType('utils')
        utils.shared_data = self.shared
        utils.stdout_obj = self.output
        utils.stdout_cmd = self.commands
        utils.stdout_err = self.errors
        self.websocket = types.ModuleType('websocket')
        self.websocket.create_connection = Mock()
        self.websocket.WebSocketTimeoutException = type('Timeout', (Exception,), {})
        with patch.dict(sys.modules, {'utils': utils, 'websocket': self.websocket}):
            spec = importlib.util.spec_from_file_location('live_adapter',
                Path(__file__).parents[1] / 'audio2text/livetranslate.py')
            self.module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(self.module)
        self.engine = self.module.LiveTranslateRecognizer('zh', 'key', 'workspace')

    def event(self, kind, **kwargs):
        self.engine.on_event({'type': kind, **kwargs})

    def source(self, item_id, text):
        self.event('conversation.item.input_audio_transcription.delta', item_id=item_id, delta=text)

    def link(self, target_id, source_id):
        self.event('conversation.item.created', previous_item_id=source_id,
                   item={'id': target_id, 'role': 'assistant'})

    def test_session_parameters_and_region(self):
        self.engine.ready.set()
        with patch.object(self.module.threading, 'Thread'):
            self.engine.start()
        args = self.websocket.create_connection.call_args
        self.assertIn('workspace.cn-beijing.maas.aliyuncs.com', args.args[0])
        self.assertIn('qwen3.8-livetranslate-flash-realtime', args.args[0])
        self.assertEqual(args.kwargs['header'], {'Authorization': 'Bearer key'})
        config = json.loads(self.engine.socket.send.call_args.args[0])['session']
        self.assertEqual(config['output_modalities'], ['text'])
        self.assertEqual(config['translation']['language'], 'zh')

    def test_interleaved_original_and_translation(self):
        self.source('s1', 'Hello')
        self.source('s2', 'Next')
        self.link('t1', 's1')
        self.event('response.text.delta', item_id='t1', delta='你')
        self.event('response.text.delta', item_id='t1', delta='好')
        self.event('conversation.item.input_audio_transcription.completed', item_id='s1', transcript='Hello!')
        messages = [c.args[0] for c in self.output.call_args_list]
        self.assertEqual(messages[-2]['translation'], '你好')
        self.assertEqual(messages[0]['time_s'], messages[-2]['time_s'])
        self.assertEqual(messages[-1]['index'], 1)
        self.assertEqual(messages[-1]['translation'], '你好')
        self.assertTrue(messages[-1]['update_by_time'])

    def test_translation_before_original_or_link(self):
        self.event('response.text.delta', item_id='t1', delta='你好')
        self.link('t1', 's1')
        self.output.assert_not_called()
        self.source('s1', 'Hello')
        self.assertEqual(self.output.call_args.args[0]['translation'], '你好')

    def test_final_translation_replaces_partial(self):
        self.source('s1', 'Hello')
        self.link('t1', 's1')
        self.event('response.text.delta', item_id='t1', delta='你')
        self.event('response.text.done', item_id='t1', text='你好！')
        self.assertEqual(self.output.call_args.args[0]['translation'], '你好！')

    def test_disabled_translation_keeps_original(self):
        self.engine.target = None
        self.source('s1', 'Hello')
        self.link('t1', 's1')
        self.event('response.text.delta', item_id='t1', delta='你好')
        self.assertEqual(self.output.call_count, 1)
        self.assertEqual(self.output.call_args.args[0]['translation'], '')

    def test_audio_is_base64_encoded(self):
        self.engine.socket = Mock()
        self.shared.chunk_queue.put(b'\x00\x01')
        self.engine.socket.send.side_effect = lambda _: setattr(self.shared, 'status', 'stop')
        self.engine.translate()
        event = json.loads(self.engine.socket.send.call_args.args[0])
        self.assertEqual(event['type'], 'input_audio_buffer.append')
        self.assertEqual(base64.b64decode(event['audio']), b'\x00\x01')

    def test_stop_flushes_then_closes(self):
        self.engine.socket = Mock()
        self.engine.socket.send.side_effect = lambda _: self.event('session.finished')
        self.engine.stop()
        self.assertEqual(json.loads(self.engine.socket.send.call_args.args[0])['type'], 'session.finish')
        self.engine.socket.close.assert_called_once()
        self.errors.assert_not_called()

    def test_server_errors_wake_waits_and_request_exit(self):
        self.event('error', error={'message': 'Invalid API key'})
        self.assertTrue(self.engine.ready.is_set())
        self.assertTrue(self.engine.finished.is_set())
        self.assertEqual(self.shared.status, 'kill')
        self.errors.assert_called_once_with('Invalid API key')

    def test_abnormal_close_reports_error(self):
        self.engine.socket = Mock()
        self.engine.socket.recv.return_value = ''
        self.engine.receive()
        self.assertTrue(self.engine.failed)

    def test_configuration_validation_and_environment(self):
        with patch.dict('os.environ', {'DASHSCOPE_API_KEY': 'env-key', 'DASHSCOPE_WORKSPACE_ID': 'env-space'}):
            engine = self.module.LiveTranslateRecognizer('ja', region='ap-southeast-1')
        self.assertEqual(engine.api_key, 'env-key')
        self.assertIn('env-space.ap-southeast-1.', engine.url)
        with self.assertRaises(ValueError): self.module.LiveTranslateRecognizer('invalid', 'key', 'space')
        with self.assertRaises(ValueError): self.module.LiveTranslateRecognizer('zh', 'key', 'space/bad')


if __name__ == '__main__':
    unittest.main()
