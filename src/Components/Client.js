import React from 'react'
import Avatar from 'react-avatar'

//npm install --save react-avatar  --legacy-peer-deps
const Client = ({ username }) => {
  console.log(username);
  return (
      <div className="client">
          <Avatar name={username} size={50} round="14px" />
          <span className="userName">{username}</span>
      </div>
  );
};


export default Client