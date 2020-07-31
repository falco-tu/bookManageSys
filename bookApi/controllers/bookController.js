var dbConfig = require('../util/dbconfig')

// 获取列表
getBookList = (req, res, next) => {
  var sql = 'select * from book';
  var sqlArr = [];
  var callback = (err, data) => {
    if (err) {
      console.log('连接出错了')
    } else {
      res.send({
        'list': data
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback)
}

// 创建书籍
createNewBook = (req, res, next) => {
  let {isbn, book_name, book_cover, author} = req.body;
  console.log(req.body, 'req.body')
  var sql = 'insert into book(isbn, book_name, book_cover, author) value(?,?,?,?)';
  var sqlArr = [isbn, book_name, book_cover, author];
  var callback = (err, data) => {
    if (err) {
      console.log('连接出错了')
    } else {
      res.send({
        id: data.insertId,
        isbn, book_name, book_cover, author
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback)
}

// 删除书籍
deleteBook = (req, res, next) => {
  let {id} = req.params;
  var sql = 'delete from book where id=?';
  var sqlArr = [id];
  var callback = (err, data) => {
    if (err) {
      console.log('连接出错了')
    } else {
      res.send({
        'status': 'OK'
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback)
}

// 修改书籍
updateBook = (req, res, next) => {
  let {isbn, book_name, book_cover, author} = req.body;
  let {id} = req.params;
  var sql = `update book set isbn=?, book_name=?, book_cover=?, author=? where id=${id}`;
  var sqlArr = [isbn, book_name, book_cover, author];
  var callback = (err, data) => {
    if (err) {
      console.log(err, 'err');
      console.log('连接出错了')
    } else {
      res.send({
        'status': 'OK'
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback)
}

module.exports = {
  getBookList,
  createNewBook,
  deleteBook,
  updateBook
}