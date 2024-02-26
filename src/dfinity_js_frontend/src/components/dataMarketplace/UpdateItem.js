import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { toast } from "react-toastify";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import { getItem, updateDataItem } from '../../utils/dataMarketplace';


const UpdateItem = ({itemId}) => {
    const [title, setTitle] = useState("");
    const [attachmentURL, setImage] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [seller, setSeller] = useState("");
    const [dataFormat, setDataFormat] = useState("");
    const [status, setStatus] = useState("");
    const [quality, setQuality] = useState("");
    const [rating, setRating] = useState(0);

    const isFormFilled = () => title && attachmentURL && description  && price && seller && dataFormat && status && quality && rating;

    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                const item = await getItem(itemId);
                setTitle(item.title);
                setImage(item.attachmentURL);
                setDescription(item.description);
                setPrice(item.price);
                setSeller(item.seller);
                setDataFormat(item.dataFormat);
                setStatus(item.status);
                setQuality(item.quality);
                setRating(item.rating);
            
            } catch (error) {
                console.error(error);
            }
        };

        fetchItemDetails();
    }, [itemId]);
    

    const updateItem = async () => {
        try {
            const id = itemId;
            const priceInt = parseInt(price);
            const ratingInt = parseInt(rating);
            await updateDataItem(id, {title, attachmentURL, description, price: priceInt, seller, dataFormat, status, quality, rating: ratingInt});
            toast(<NotificationSuccess text="Data Item updated successfully." />);
            window.location.reload();
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to update a Data Item." />);
        }
    }

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi-pencil-square"></i>
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="title">
              <FloatingLabel controlId="title" label="Title">
                <Form.Control
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="attachmentURL">
              <FloatingLabel controlId="attachmentURL" label="Attachment URL">
                <Form.Control
                  type="text"
                  placeholder="Attachment URL"
                  value={attachmentURL}
                  onChange={(e) => setImage(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <FloatingLabel controlId="description" label="Description">
                <Form.Control
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="price">
              <FloatingLabel controlId="price" label="Price">
                <Form.Control
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="seller">
              <FloatingLabel controlId="seller" label="Seller">
                <Form.Control
                  type="text"
                  placeholder="Seller"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="dataFormat">
              <FloatingLabel controlId="dataFormat" label="Data Format">
                <Form.Control
                  type="text"
                  placeholder="Data Format"
                  value={dataFormat}
                    onChange={(e) => setDataFormat(e.target.value)}
                />
                </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="status">
              <FloatingLabel controlId="status" label="Status">
                <Form.Control
                  type="text"
                  placeholder="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="quality">
              <FloatingLabel controlId="quality" label="Quality">
                <Form.Control
                  type="text"
                  placeholder="Quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="rating">
              <FloatingLabel controlId="rating" label="Rating">
                <Form.Control
                  type="number"
                  placeholder="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {updateItem(); handleClose()}}
            disabled={!isFormFilled()}
          >
            Update
          </Button>
        </Modal.Footer>
        </Modal>
    </>

  )
}

export default UpdateItem