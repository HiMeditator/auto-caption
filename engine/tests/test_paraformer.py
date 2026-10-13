"""Offline contract tests: no audio devices, API keys or network required."""
import importlib.util
import queue
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


class ParaformerTests(unittest.TestCase):
    def setUp(self):
        self.shared = types.SimpleNamespace(status='running', chunk_queue=queue.Queue())
        self.output = Mock()
        self.commands = Mock()
        self.errors = Mock()
        self.translation = Mock()
        self.sdk = types.ModuleType('dashscope')
        asr = types.ModuleType('dashscope.audio.asr')
        asr.Recognition = Mock()
        asr.RecognitionCallback = object
        asr.RecognitionResult = types.SimpleNamespace(
            is_sentence_end=lambda s: s.get('end_time') is not None)
        utils = types.ModuleType('utils')
        utils.shared_data = self.shared
        utils.stdout_obj = self.output
        utils.stdout_cmd = self.commands
        utils.stdout_err = self.errors
        utils.get_translation_function = Mock(return_value=self.translation)
        with patch.dict(sys.modules, {'dashscope': self.sdk,
                                     'dashscope.audio.asr': asr, 'utils': utils}):
            spec = importlib.util.spec_from_file_location(
                'paraformer_adapter', Path(__file__).parents[1] / 'audio2text/paraformer.py')
            self.module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(self.module)
        self.asr = asr

    def engine(self, source='auto', target=None, key='test-key'):
        return self.module.ParaformerRecognizer(16000, source, target, key, 'google', '')

    def event(self, begin, text, end=None):
        result = Mock()
        result.get_request_id.return_value = 'request-1'
        result.get_sentence.return_value = {'begin_time': begin, 'text': text, 'end_time': end}
        return result

    def test_sdk_parameters_and_environment_key(self):
        with patch.dict('os.environ', {'DASHSCOPE_API_KEY': 'env-key'}):
            self.engine(key='')
        self.assertEqual(self.sdk.api_key, 'env-key')
        args = self.asr.Recognition.call_args.kwargs
        self.assertEqual((args['model'], args['format'], args['sample_rate']),
                         ('paraformer-realtime-v2', 'pcm', 16000))
        self.assertEqual(args['language_hints'], [])
        self.assertTrue(args['heartbeat'])
        self.engine(source='ja')
        self.assertEqual(self.asr.Recognition.call_args.kwargs['language_hints'], ['ja'])

    def test_missing_key_and_unsupported_language(self):
        with patch.dict('os.environ', {}, clear=True):
            with self.assertRaises(ValueError): self.engine(key='')
        with self.assertRaises(ValueError): self.engine(source='es')

    def test_partial_final_identity_and_next_sentence(self):
        callback = self.module.Callback(self.engine())
        callback.on_event(self.event(0, 'Hello'))
        callback.on_event(self.event(0, 'Hello world', 200))
        callback.on_event(self.event(300, 'Next', 500))
        captions = [c.args[0] for c in self.output.call_args_list]
        self.assertEqual([c['index'] for c in captions], [1, 1, 2])
        self.assertEqual(captions[0]['time_s'], captions[1]['time_s'])
        self.assertEqual(captions[1]['translation'], '')
        self.translation.assert_not_called()

    def test_only_final_sentence_translates_once(self):
        callback = self.module.Callback(self.engine(target='zh'))
        with patch.object(self.module.threading, 'Thread') as thread:
            callback.on_event(self.event(0, 'Hello'))
            thread.assert_not_called()
            callback.on_event(self.event(0, 'Hello world', 200))
            callback.on_event(self.event(0, 'Hello world', 200))
            thread.assert_called_once()
            self.assertEqual(thread.call_args.kwargs['args'][1:3], ('zh', 'Hello world'))
            thread.return_value.start.assert_called_once()

    def test_empty_events_are_ignored(self):
        callback = self.module.Callback(self.engine())
        callback.on_event(self.event(0, ' '))
        result = Mock()
        result.get_sentence.return_value = None
        callback.on_event(result)
        self.output.assert_not_called()

    def test_error_and_abnormal_close_request_exit(self):
        engine = self.engine()
        callback = self.module.Callback(engine)
        callback.on_error(types.SimpleNamespace(message='Authentication failed'))
        callback.on_close()
        self.assertEqual(self.shared.status, 'kill')
        self.errors.assert_called_once_with('Authentication failed')
        self.commands.assert_any_call('kill')

    def test_normal_stop_does_not_request_kill(self):
        engine = self.engine()
        engine.stop()
        callback = self.module.Callback(engine)
        callback.on_complete()
        callback.on_close()
        self.assertEqual(self.shared.status, 'running')
        self.errors.assert_not_called()

    def test_send_failure_stops_loop(self):
        engine = self.engine()
        engine.recognizer.send_audio_frame.side_effect = RuntimeError('Disconnected')
        self.shared.chunk_queue.put(b'pcm')
        engine.translate()
        self.assertEqual(self.shared.status, 'kill')


if __name__ == '__main__':
    unittest.main()
