import { useEffect, useMemo, useRef, useState } from "react"

function App() {

  // Sab sa Pahla 4 state baneo 
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState([]);
  const [timer, setTimer] = useState(0)
  const [searchText, setSearchText] = useState('')

  // Pher 4 Reference bana ha useRef hook ka use kar ka taka data save rahe
  const mediaRecorderRef = useRef(null);
  const audioChunkRef = useRef([]);
  const intervalRef = useRef(null);
  const listEndRef = useRef(null);


  // Notes ko Filter Karna useMemo ka use kar ka 
  const filtersNotes = useMemo(() => {
    console.log('Huzaifa Filtering Chal Rahe ha Wait Karo.....');
    return notes.filter((note) => {
      return note.text.toLowerCase().includes(searchText.toLowerCase()) // Ye return add karo
    });
  }, [notes, searchText])

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);


  // Create Start reccording function for OnClick Event
  const startRecording = async () => {
    try {
      // Pahla Browser sa Mic Open Karna ki Permission Mango
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunkRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunkRef.current.push(e.data)
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunkRef.current, { type: 'audio/webm' });

        const fakeText = `Voice note ${notes.length + 1} - ${timer} second`

        const newNote = {
          id: Date.now(),
          text: fakeText,
          audioUrl: URL.createObjectURL(audioBlob),
          duration: timer
        };

        setNotes(prev => [...prev, newNote]);

        stream.getTracks().forEach(track => track.stop())
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      setTimer(0);
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.log('Mic ki Permission Nahe mele bhai', error.message);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false)
      clearInterval(intervalRef.current)
    }
  }

  return (
    <div className="p-5 max-w-150 m-auto mt-2 border rounded-[18px]">
      <h1 className="mb-1 ml-1">Ai Voice Notes Tracker</h1>
      <div className="border-2 border-[#ccc] p-5">
        <h2 className="mb-2">Timer: {timer}s</h2>
        {
          !isRecording ? (
            <button onClick={startRecording} className="py-2.5 px-7.5 rounded-[10px] text-[16px] border">Start Recording</button>
          ) : (
            <button onClick={stopRecording} className="py-2.5 px-7.5 rounded-[10px] text-[16px]  bg-red-600 text-white">Stop Recording</button>
          )}
      </div>
      {/* Ab ham Search Wala Field Likha ga jes ma ham Usememo topic cover karenga */}
      <input type="search"
        placeholder="Search Yours Notes...."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full p-2.5 my-[15px] rounded-lg outline-none  text-[16px] border"
      />

      {/* Ab Yaha Notes ko ake List form ma dekhayenga  */}
      <div className="border-2 border-[#ccc] p-[20px] rounded-[8px] h-[300px] overflow-y-auto">
        <h2>Your Notes: {filtersNotes.length}</h2>
        {filtersNotes.length === 0 && <p>Notes Note Found. Please Start Recording</p>}
        {
          filtersNotes.map((nodetxt) => (
            <div key={nodetxt.id} className="border-b p-2.5">
              <p><b>{nodetxt.text}</b></p>
              <audio controls src={nodetxt.audioUrl}></audio>
              <p>Duration: {nodetxt.duration}s</p>
            </div>
          ))}
        <div ref={listEndRef} />
      </div>
    </div>
  )
}
export default App