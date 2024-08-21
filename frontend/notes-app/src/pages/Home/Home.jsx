import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import moment from "moment";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/Cards/EmptyCard";
import imgSrc from "../../assets/images/add-note.svg";
import noDataImg from "../../assets/images/no_data.svg";
export default function Home() {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShow: false,
    type: "add",
    data: null,
  });
  const [openToast, setOpenToast] = useState({
    isShow: false,
    message: "",
    type: "add",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, SetIsSearch] = useState(false);
  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShow: true,
      type: "edit",
      data: noteDetails,
    });
  };

  const openToastMessage = (message, type) => {
    setOpenToast({
      isShow: true,
      message,
      type,
    });
  };
  const handleCloseToast = () => {
    setOpenToast({
      isShow: false,
      message: "",
      type: "add",
    });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        openToastMessage("Note deleted successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again later.");
      }
    }
  };

  //Search Note
  const searchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        SetIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again later.");
      }
    }
  };

  //update isPinned
  const handlePinNote = async (noteData) => {
    const noteId = noteData._id;
    console.log(noteData.isPinned);
    try {
      const response = await axiosInstance.put("/pin-note/" + noteId, {
        isPinned: !noteData.isPinned,
      });
      if (response.data && response.data.note) {
        openToastMessage("Note pin updated successfully");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Clear Search
  const clearSearch = () => {
    SetIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);
  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearch={searchNote}
        onClearSearch={clearSearch}
      />

      <div className="container px-20 mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((note, index) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={moment(note.createdOn).format("Do, MMM, YYYY hh:mm A")}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => handleEdit(note)}
                onDelete={() => deleteNote(note)}
                onPinNote={() => handlePinNote(note)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? noDataImg : imgSrc}
            message={
              isSearch
                ? `Oops! No notes found matching the search query. Please try again with different keywords.`
                : `Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, reminders, and more. Lets get started!`
            }
          />
        )}
      </div>
      <button
        onClick={() =>
          setOpenAddEditModal({ isShow: true, type: "add", data: null })
        }
        className="w-16 h-16 flex items-center justify-center fixed bottom-10 right-10 bg-primary rounded-2xl"
      >
        <MdAdd className="text-[28px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModal.isShow}
        onRequestClose={() => {}}
        style={{ overlay: { backgroundColor: "rgba(0,0,0,0.5)" } }}
        contentLabel=""
        className="w-[40%] max-x-3/4 bg-white p-5 rounded-md mx-auto mt-14 overflow-scroll"
      >
        <AddEditNotes
          getAllNotes={getAllNotes}
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ ...openAddEditModal, isShow: false })
          }
          openToastMessage={openToastMessage}
        />
      </Modal>
      <Toast
        isShow={openToast.isShow}
        message={openToast.message}
        type={openToast.type}
        onClose={handleCloseToast}
      />
    </>
  );
}
