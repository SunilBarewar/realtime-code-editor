import React, { useState,useRef, useEffect } from 'react'
import Client from '../Components/Client';
import Editor from '../Components/Editor';
import { socket as initSocket } from '../socket';
import ACTIONS from '../Action';
import { Navigate, useLocation,useNavigate,useParams} from 'react-router-dom';
import toast from 'react-hot-toast';
// import io from 'socket.io-client'


// const so  = io(process.env.REACT_APP_BACKEND_URL);
const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef  = useRef(null);
  const location = useLocation();
  const reactNavigator =  useNavigate();
  const {roomId} = useParams();
  const [Clients,setClients] = useState([]);
  useEffect(() => {
    const init = async () =>{
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
          console.log('socket error', e);
          toast.error('Socket connection failed');
          reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(ACTIONS.JOINED,({clients,username,socketId}) =>{
        if(username !== location.state?.username){
          toast.success(`${username} joined the room` );
          console.log(`${username} joined`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE,{
          code :codeRef.current,
          socketId
        });
      })

      // listening for disconnectd user
      socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,username}) =>{
        toast.success(`${username} left the room`)
        setClients((prev) =>{
          return prev.filter(
                client =>client.socketId !== socketId
            );
        })
      })
    };
    init();

    return () =>{
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    }
  },[]);

  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success(`RoomID copied to clipboard`)
    }catch(err){
        toast.error('Could not copy the room Id')
        console.log(err);
    }
  }
  function leaveRoom(){
    reactNavigator('/');
  }
  if(!location.state){
    return <Navigate to = "/" />
  }
  return (
      <div className='mainWrap'>
        <div className='aside'>
          <div className='asideInner'>
              <div className='logo'>
                <img className='logoImage' src="/code-sync.png" alt="logo" />
              </div>
              <h3>Connected</h3>
              <div className='clientList'>
                {/* {Clients.map((client) =>(
                      <Client 
                      key={client.socketId} 
                      userName={client.username}
                      />
                  ))} */}
                   {Clients.map((client) => (
                    <Client
                        key={client.socketId}
                        username={client.username}
                    />
                ))}
              </div>
          </div>
          <button className='btn copyBtn'
           onClick={copyRoomId}>Copy ROOM ID</button>
          <button className='btn leaveBtn'
           onClick={leaveRoom}>Leave</button>
        </div>
        <div className='editorWrap'>
                {/* <h3 style={{color : 'white'}}>editor is here</h3> */}
              <Editor socketRef = {socketRef} roomId = {roomId}
               onCodeChange = {(code) =>
               (codeRef.current = code)}/>
        </div>
      </div>
  )
}

export default EditorPage