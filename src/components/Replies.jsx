import React from 'react';

type ReplyProp = {
  id: string,
  text: string,
  username: string,
  createdAt: string,
}

type Props = {
  replies: Array<ReplyProp>,
}

export default function Replies({replies}: Props) {
  return (<div className='replies'>
    {replies.map((reply, index) => {
      return <div key={index} className="reply">
        <b>{reply.user}</b> {reply.text}
      </div>
    })}
  </div>)
}
