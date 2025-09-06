import queue

class SharedData:
    def __init__(self):
        self.status = "running"
        self.chunk_queue = queue.Queue()

shared_data = SharedData()