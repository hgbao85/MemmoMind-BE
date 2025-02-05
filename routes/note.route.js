import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import {
  addNote,
  // deleteNote,
  editNote,
  getAllNotes,
  searchNote,
  updateNotePinned,
  getTrashedNotes,
  moveToTrash,
  restoreNote,
  permanentlyDeleteNote,
} from "../controller/note.controller.js"

const router = express.Router()

router.post("/add", verifyToken, addNote)
router.post("/edit/:noteId", verifyToken, editNote)
router.get("/all", verifyToken, getAllNotes)
// router.delete("/delete/:noteId", verifyToken, deleteNote)
router.put("/update-note-pinned/:noteId", verifyToken, updateNotePinned)
router.get("/trash", verifyToken, getTrashedNotes);
router.put("/trash/:noteId", verifyToken, moveToTrash); // Move to Trash
router.put("/restore/:noteId", verifyToken, restoreNote); // Restore from Trash
router.delete("/delete-permanent/:noteId", verifyToken, permanentlyDeleteNote); // Permanently Delete
router.get("/search", verifyToken, searchNote)

export default router
