import Note from "../models/note.model.js"
import { errorHandler } from "../utils/error.js"

export const addNote = async (req, res, next) => {
  const { title, content, tags } = req.body

  const { id } = req.user

  if (!title) {
    return next(errorHandler(400, "Title is required"))
  }

  if (!content) {
    return next(errorHandler(400, "Content is required"))
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: id,
    })

    await note.save()

    res.status(201).json({
      success: true,
      message: "Thêm ghi chú thành công!",
      note,
    })
  } catch (error) {
    next(error)
  }
}

export const editNote = async (req, res, next) => {
  const note = await Note.findById(req.params.noteId)

  if (!note) {
    return next(errorHandler(404, "Note not found"))
  }

  if (req.user.id !== note.userId) {
    return next(errorHandler(401, "You can only update your own note!"))
  }

  const { title, content, tags, isPinned, isDeleted } = req.body

  if (!title && !content && !tags) {
    return next(errorHandler(404, "No changes provided"))
  }

  try {
    if (title) {
      note.title = title
    }

    if (content) {
      note.content = content
    }

    if (tags) {
      note.tags = tags
    }

    if (isPinned) {
      note.isPinned = isPinned
    }
    if (isDeleted) {
      note.isDeleted = isDeleted
    }

    await note.save()

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      note,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllNotes = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const notes = await Note.find({ userId: userId, isDeleted: false }).sort({ isPinned: -1 });

    res.status(200).json({
      success: true,
      message: "All notes retrieved successfully",
      notes,
    });
  } catch (error) {
    next(error);
  }
};


export const updateNotePinned = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId)

    if (!note) {
      return next(errorHandler(404, "Không tìm thấy ghi chú!"))
    }

    if (req.user.id !== note.userId) {
      return next(errorHandler(401, "You can only update your own note!"))
    }

    const { isPinned } = req.body

    note.isPinned = isPinned

    await note.save()

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      note,
    })
  } catch (error) {
    next(error)
  }
}

export const moveToTrash = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    note.isDeleted = true; // Mark as deleted
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note moved to Trash!",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const restoreNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    note.isDeleted = false; // Restore note
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note restored successfully!",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrashedNotes = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const trashedNotes = await Note.find({ userId: userId, isDeleted: true });

    res.status(200).json({
      success: true,
      message: "Trashed notes retrieved successfully",
      notes: trashedNotes,
    });
  } catch (error) {
    next(error);
  }
};

export const searchNote = async (req, res, next) => {
  const { query } = req.query

  if (!query) {
    return next(errorHandler(400, "Search query is required"))
  }

  try {
    const matchingNotes = await Note.find({
      userId: req.user.id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    })

    res.status(200).json({
      success: true,
      message: "Notes matching the search query retrieved successfully",
      notes: matchingNotes,
    })
  } catch (error) {
    next(error)
  }
}

export const permanentlyDeleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    await Note.deleteOne({ _id: noteId }); // Permanently delete the note

    res.status(200).json({
      success: true,
      message: "Note permanently deleted!",
    });
  } catch (error) {
    next(error);
  }
};
