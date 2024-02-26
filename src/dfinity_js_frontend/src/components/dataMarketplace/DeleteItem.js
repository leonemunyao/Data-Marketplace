import React from 'react'
import { Button } from 'react-bootstrap'

const DeleteItem = ({discard}) => {
  return (
    <Button 
    onClick={()=>{
        discard()
    }}
    variant='dark'
    className='rounded-pill px-0'
    style={{width: "38px"}}
    >
        <i className="bi-trash-fill"></i>
    </Button>

  )
}

export default DeleteItem