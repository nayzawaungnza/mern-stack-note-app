import React, { useState } from "react";
import TagInput from "../../components/Input/TagInput";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/axiosinstance";

export default function AddEditNotes({
  noteData,
  type,
  getAllNotes,
  onClose,
  openToastMessage,
}) {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);

  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data && response.data.note) {
        openToastMessage("Note added successfully");
        getAllNotes();
        onClose();
      }

      //clear form
      // setTitle("");
      // setContent("");
      // setTags([]);
      setError("");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };
  const editNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/edit-note/" + noteId, {
        noteId: noteData._id,
        title,
        content,
        tags,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data && !response.data.error) {
        openToastMessage("Note updated successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };
  const handleAddNote = () => {
    if (!title) {
      setError("Please provide title for note");
      return;
    }
    if (!content) {
      setError("Please provide content for note");
      return;
    }
    setError("");

    if (type === "add") {
      addNewNote();
    } else if (type === "edit") {
      editNote();
    }
  };

  return (
    <div className="relative">
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-5 -right-5 hover:bg-slate-100"
        onClick={onClose}
      >
        <MdClose className="text-xl text-slate-500" />
      </button>
      <div className="flex flex-col gap-2">
        <label className="input-label">Title</label>
        <input
          type="text"
          className="text-2xl text-slate-950 bg-slate-200 p-2 rounded outline-none"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">Content</label>
        <textarea
          type="text"
          className="text-sm text-slate-950 outline-none bg-slate-200 p-2 rounded"
          placeholder="Content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="mt-3">
        <label className="input-label">TAGS</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>
      {error && <p className="text-red-500 text-xs pt-4 ">{error}</p>}
      <button
        onClick={handleAddNote}
        className="btn-primary font-medium mt-5 p-3"
      >
        {type === "add" ? "Add Note" : "Update Note"}
      </button>
    </div>
  );
}
