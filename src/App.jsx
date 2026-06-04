import { useEffect, useMemo, useRef, useState } from "react";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState([]);
  const [timer, setTimer] = useState(0);
  const [searchText, setSearchText] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunkRef = useRef([]);
  const intervalRef = useRef(null);
  const listEndRef = useRef(null);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.text.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [notes, searchText]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunkRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunkRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunkRef.current, {
          type: "audio/webm",
        });

        const newNote = {
          id: Date.now(),
          text: `Voice Note ${notes.length + 1}`,
          audioUrl: URL.createObjectURL(audioBlob),
          duration: timer,
        };

        setNotes((prev) => [...prev, newNote]);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);

      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          AI Voice Notes Tracker
        </h1>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">
              Timer: {timer}s
            </h2>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-white font-medium"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 transition rounded-xl text-white font-medium"
              >
                Stop Recording
              </button>
            )}
          </div>
        </div>

        <input
          type="search"
          placeholder="Search notes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-indigo-500 mb-5"
        />

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 h-[450px] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">
              Your Notes
            </h2>

            <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-sm">
              {filteredNotes.length}
            </span>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400">
                No notes found
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4"
              >
                <h3 className="text-white font-semibold mb-3">
                  {note.text}
                </h3>

                <audio
                  controls
                  src={note.audioUrl}
                  className="w-full mb-3"
                />

                <p className="text-slate-400 text-sm">
                  Duration: {note.duration}s
                </p>
              </div>
            ))
          )}

          <div ref={listEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;