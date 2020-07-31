var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController')

/* GET home page. */
router.get('/', bookController.getBookList);

router.post('/', bookController.createNewBook);

router.delete('/:id', bookController.deleteBook);

router.put('/:id', bookController.updateBook);

module.exports = router;
