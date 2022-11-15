const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const noteSchema = require("../schemas/noteSchema");
const authUser = require("../auth/authUser");

router.get("/allnotes", authUser, async (req, res) => {
  try {
    const existingNotes = await noteSchema.find({ user: req.user.id });
    res.json(existingNotes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/addnote",
  authUser,
  body("title", "Title cannot be blank").exists(),
  body("description", "Enter the description").exists(),
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new noteSchema({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const noteSaved = await note.save();
      res.json(noteSaved);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put("/editnote/:id", authUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    let newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    const existingNote = await noteSchema.findById(req.params.id);
    if (!existingNote) {
      return res.status(404).send("File Not Found");
    }

    if (existingNote.user.toString() !== req.user.id) {
      return res.status(401).send("Forbidden");
    }
    const noteSaved = await noteSchema.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ noteSaved });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/deletenote/:id", authUser, async (req, res) => {
  try {
    const existingNote = await noteSchema.findById(req.params.id);
    if (!existingNote) {
      return res.status(404).send("File Not Found");
    }

    if (existingNote.user.toString() !== req.user.id) {
      return res.status(401).send("Forbidden");
    }
    deletedNote = await noteSchema.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: deletedNote });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
