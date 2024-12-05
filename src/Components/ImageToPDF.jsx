import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";

export default function ImageToPDF() {
    const [images, setImages] = useState([]);

    // Add new images
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            id: uuidv4(), // Unique identifier
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    // Remove an image
    const handleRemoveImage = (id) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    // Handle drag-and-drop reordering
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setImages((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over?.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    // Generate PDF from selected images
    const generatePDF = async () => {
        if (images.length === 0) {
            alert("No images to generate a PDF");
            return;
        }

        const pdf = new jsPDF();
        for (let i = 0; i < images.length; i++) {
            const imgData = await toBase64(images[i].file);
            pdf.addImage(imgData, "JPEG", 10, 10, 180, 160);
            if (i !== images.length - 1) {
                pdf.addPage();
            }
        }
        pdf.save("images.pdf");
    };

    // Convert file to Base64 for jsPDF
    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <section style={{ padding: "20px" }}>

            <label htmlFor="pdf" style={{
                padding: "10px 20px",
                backgroundColor: "aqua",
                cursor: "pointer"
            }}>
                {images.length === 0 ? "Select Images" : "Add More"}
            </label>
            <input
                type="file"
                multiple
                accept="image/*"
                id="pdf"
                onChange={handleImageChange}
                style={{ display: "none" }}
            />

            {
                images.length > 0 &&
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map((img) => img.id)}>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            {images.map((image) => (
                                <SortableImage
                                    key={image.id}
                                    id={image.id}
                                    preview={image.preview}
                                    onRemove={() => handleRemoveImage(image.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            }

            <button
                onClick={generatePDF}
                style={{
                    padding: "10px 20px",
                    marginBottom: "20px",
                    cursor: "pointer",
                    backgroundColor: "blue",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    position: "relative",
                    marginTop: "50px"
                }}
            >
                Generate PDF
            </button>
        </section>
    );
}

// Sortable Image Component
const SortableImage = ({ id, preview, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: "100px",
        height: "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "5px",
        background: "#fff",
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div {...attributes} {...listeners} style={{ cursor: "grab" }}>
                <img
                    src={preview}
                    alt="Selected"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
            </div>
            <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
            >
                Remove
            </button>
        </div>

    );
}
