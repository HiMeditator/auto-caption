import argparse

def gummy_engine(s, t, a, c, k):
    pass

def vosk_engine(a, c, m):
    pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    # both
    parser.add_argument('-e', '--caption_engine', default='gummy', help='Caption engine: gummy or vosk')
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output, 1 for input')
    parser.add_argument('-c', '--chunk_rate', default=20, help='Number of audio stream chunks collected per second')
    # gummy
    parser.add_argument('-s', '--source_language', default='en', help='Source language code')
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code')
    parser.add_argument('-k', '--api_key', default='', help='API KEY for Gummy model')
    # vosk
    parser.add_argument('-m', '--model_path', default='', help='The path to the vosk model.')
    args = parser.parse_args()
    if args.caption_engine == 'gummy':
        gummy_engine(
            args.source_language,
            args.target_language,
            int(args.audio_type),
            int(args.chunk_rate),
            args.api_key
        )
    elif args.caption_engine == 'vosk':
        vosk_engine(
            int(args.audio_type),
            int(args.chunk_rate),
            args.model_path
        )
    else:
        raise ValueError('Invalid caption engine specified.')