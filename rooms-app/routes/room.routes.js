const { Router } = require('express');
const router = new Router();
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');


const Room = require('../models/Room.model');
// const User = require('../models/User.model');

router.get('/room', isLoggedOut, (req, res) => {
 
  Room.find()
    .then((allTheRoomFromDB) => {
      res.render('room/list', {allTheRoomFromDB})
    })
    .catch((err) => `Could not find all rooms: ${err}`);
});

router.get('/room/create', isLoggedIn, (req, res) => res.render('room/create-form'));


router.post('/room/create', isLoggedIn, (req, res) => {
 
  const { name, description, imageUrl } = req.body;

  Room.create({ name, description, imageUrl, owner })
    .then(() => res.redirect('/room'))
    .catch((err) => `Your room cannot be made ${err}`);
});

router.get("/room/:id/edit", (req, res) => {
  const { id } = req.params;

  Room.findById(id)
    .then((room) => {
      res.render("room/edit", room);
    })
    .catch((error) => `Error while getting a single room for edit: ${error}`);
});

router.post("/room/:id/edit", (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl} = req.body;

  Room.findByIdAndUpdate(
    id,
    { name, description, imageUrl},
  )
    .then(() => res.redirect('/'))
    .catch((error) =>
      console.log(`Error while updating a single room: ${error}`)
    );
});

router.post("/room/:id/delete", (req, res) => {
  const { id } = req.params;

  Room.findByIdAndDelete(id)
    .then(() => res.redirect("/room"))
    .catch((error) => console.log(`Error while deleting a room: ${error}`));
});


module.exports = router;