# bookManageSys
使用 backbone 写的一个图书管理系统, 前端是用 jquery + backbone + boostrap,  后端是 node + express + mysql



前端项目在 webProject 文件夹下

后端项目在 bookApi 文件夹下



界面如下：

![image](http://faico.uuunion.cn/image-20200729200606596.png)



![image](http://faico.uuunion.cn/image-20200729200836680.png)



数据库表（id, isbn, book_name, book_cover, author）

![image](http://faico.uuunion.cn/image-20200729201344230.png)



## 后端 node + express + mysql 部分

创建数据库 bookdb, 创建表 book,  添加字段 id, isbn, book_name, book_cover, author，我是在 Navicat Premium 上手动创建的

![image](http://faico.uuunion.cn/image-20200729201656056.png)



安装 express 

```bash
# 全局安装express
$ npm install express -g 

# 生成项目
$ express --view=pug bookApi

# 进入项目/装包
$ cd bookApi
$ npm install (或者 npm i 简写)
```

生成以下目录结构

![image](http://faico.uuunion.cn/image-20200729202510548.png)



因为需求比较简单，只有增删改查的接口，所以对目录结构进行修改。删除 bin 目录，整理 app.js 如下

```javascript
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors  = require('cors');
var bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 引入cors，解决跨域问题
app.use(cors());

// 引入 body-parser，可以通过 req.body 拿到请求体内容
+ app.use(bodyParser.urlencoded({ extended: false }));
+ app.use(bodyParser.json());

// 改写
+ var http = require('http');
+ var server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// book是此次项目中用到的接口地址，users是express自动生成的，这个项目中没有用到，可以删掉
+ app.use('/book', indexRouter);
app.use('/users', usersRouter);

// 监听3000端口
+ server.listen('3000');

// 注释掉导出app，这里不需要导出app
// module.exports = app;
```

执行 node app.js ，访问 http://127.0.0.1:3000/book  可以看到项目已经跑起来了



连接数据库： 在 app.js 文件同级新建 util 文件夹，在文件夹下新建 dbconfig.js 文件， 引入到这里

```javascript
const mysql = require('mysql');

module.exports = {
  // 数据库配置
  config: {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',  // 密码是你自己的
    database: 'bookdb'  // 前面新建的数据库库名
  },
  //连接数据库，使用mysql的连接池连接方式
  sqlConnect: function (sql, sqlArr, callback) {
    let pool = mysql.createPool(this.config);
    pool.getConnection((err, conn)=>{
      if (err){
        console.log('连接失败');
        return;
      }
      // 事件驱动回调
      conn.query(sql, sqlArr, callback);
      // 释放连接
      conn.release();
    })
  }
}
```



改写 routes 文件夹下的 index.js 文件

```javascript
// routes/index.js 书籍增删改查的接口在这里
var express = require('express');
var router = express.Router();
// 在 app.js 文件同级新建 controllers 文件夹，在文件夹下新建 bookController.js 文件， 引入到这里
var bookController = require('../controllers/bookController');

/* GET home page. */
router.get('/', bookController.getBookList);

router.post('/', bookController.createNewBook);

router.delete('/:id', bookController.deleteBook);

router.put('/:id', bookController.updateBook);

module.exports = router;
```



完善 controllers/bookController.js 文件

```javascript
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
      console.log('连接出错了')
    } else {
      res.send({
        'status': 'OK'
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback)
};

module.exports = {
  getBookList,
  createNewBook,
  deleteBook,
  updateBook
};
```

到这里后端部分就完成了，接下来是前端部分



## 前端 jquery + backbone + boostrap 部分

目录结构：

![](C:\Users\valley\AppData\Roaming\Typora\typora-user-images\image-20200730192405879.png)



入口文件 index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="js/lib/underscore.js"></script>
  <script src="js/lib/jquery.js"></script>
  <script src="js/lib/backbone.js"></script>
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/main.css">
  <title>Document</title>
</head>
<body>
<header>
  <span class="app-title">图书管理系统</span>
</header>

<!--书籍列表页面-->
<div id="bookListBox">
  <div class="btn-wrap">
    <span class="list-title">书籍列表</span>
    <a href="#create" type="button" class="btn btn-primary">新增书籍</a>
  </div>

  <div class="row" id="bookListContent">
    <!--  这里拿到书籍列表的数据 渲染出来  -->
  </div>
</div>

<!--新增书籍页面-->
<div id="createBook">
  <h3>新增书籍</h3>
  <form id="createBookForm">

  </form>
</div>

<!--编辑书籍页面-->
<div id="editBook">
  <h3>编辑书籍</h3>
  <form id="editBookForm">

  </form>
</div>

<!--书籍列表/书籍模板-->
<script type="text/template" id="bookItemTemplate">
  <div class="col-sm-3 col-md-3">
    <div class="thumbnail" id="bookItem">
      <img src="<%= book_cover %>" class="book-cover">
      <div class="caption">
        <h4><%= book_name %></h4>
        <p>作者：<%= author %></p>
        <p><a href="#edit/<%= id %>" class="btn btn-primary" role="button">修改</a> <button class="btn btn-danger" id="btn-delete">删除</button></p>
      </div>
    </div>
  </div>
</script>

<!--编辑书籍表单-->
<script type="text/template" id="bookForm">
  <div class="form-group">
    <h4>ISBN:</h4>
    <input type="text" name="isbn" class="form-control" placeholder="ISBN" id="edit-isbn">
  </div>
  <div class="form-group">
    <h4>书名:</h4>
    <input type="text" name="book_name" class="form-control" placeholder="书名" id="edit-book-name">
  </div>
  <div class="form-group">
    <h4>作者:</h4>
    <input type="text" name="author" class="form-control" placeholder="作者" id="edit-author">
  </div>
  <div class="form-group">
    <h4>封面:</h4>
    <input type="text" name="book_cover" class="form-control" placeholder="封面" id="edit-cover">
  </div>
  <button id="btn-edit-save" class="btn btn-default">提交</button>
</script>

<script src="js/app/main.js"></script>
</body>
</html>
```



样式文件 css/main.css

```css
body{
  background-color: #eee;
}

header{
  position: relative;
  width: 100%;
  height: 60px;
  z-index: 100;
  font-size: 18px;
  background: #fff;
  -webkit-box-shadow: 0 0 8px 0 rgba(0,0,0,.1);
  box-shadow: 0 0 8px 0 rgba(0,0,0,.1);
  padding: 0 140px 0 20px;
}

header .app-title{
  line-height: 60px;
  font-size: 20px;
}

#bookListBox,#createBook,#editBook{
  width: 90vw;
  min-height: 82vh;
  padding: 20px;
  margin: 40px auto;
  background-color: white;
}

#bookListBox .btn-wrap{
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

#bookListBox .btn-wrap .list-title{
  font-size: 20px;
}

.thumbnail .book-cover{
  width: 100%;
  height: 170px;
  object-fit: cover;
}

#createBook h3, #editBook h3{
  margin-bottom: 20px;
}

.form-control{
  width: 40%;
}
```

UI 界面已完成，接口 + 逻辑部分在 js/app/main.js 中

通过路由来控制页面的展示

```javascript
// js/app/main.js

/******************* 基类 *******************/
let BookPage = Backbone.View.extend({
  hide: function () {
    this.$el.hide()
  },
  show: function () {
    this.$el.show()
  }
});

/****************** main ********************/

// 书籍列表页
let BookListPage = BookPage.extend({
  el: '#bookListBox',
})

// 新增书籍页
let CreateBookPage = BookPage.extend({
  el: '#createBook',
})

// 修改书籍页
let EditBookPage = BookPage.extend({
  el: '#editBook',
})

let AppRouter = Backbone.Router.extend({
  initialize: function () {
    this.bookListPage = new BookListPage();
    this.createBookPage = new CreateBookPage();
    this.editBookPage = new EditBookPage();
  },
  routes: {
    'create': 'createBook',
    'edit/:id': 'editBook',
    '': 'bookList',
  },
  bookList: function () {
    this.editBookPage.hide();
    this.createBookPage.hide();
    this.bookListPage.show();
  },
  createBook: function () {
    this.bookListPage.hide();
    this.editBookPage.hide();
    this.createBookPage.show();
  },
  editBook: function (id) {
    this.bookListPage.hide();
    this.createBookPage.hide();
    this.editBookPage.show();
  }
})

// 创建路由实例
let app = new AppRouter();

// 当所有的 Routers 创建并设置完毕，调用 Backbone.history.start() 开始监控 hashchange 事件并分配路由
Backbone.history.start()
```



路由完成了，开始写首页书籍列表页的数据渲染部分

```javascript
// js/app/main.js

/******************* 基类 *******************/
let BookPage = Backbone.View.extend({
  hide: function () {
    this.$el.hide()
  },
  show: function () {
    this.$el.show()
  }
});

+let BaseModel = Backbone.Model.extend({
+  api: '',
+  //通过指定 urlRoot 来设置生成基于模型 id 的 URLs 的默认 url 函数
+  urlRoot: function () {
+    return 'http://127.0.0.1:3000/' + this.api;
+  }
+});

+let BaseCollection = Backbone.Collection.extend({
+  //设置 url 属性（或函数）以指定集合对应的服务器位置
+  url: function () {
+    return 'http://127.0.0.1:3000/' + this.model.prototype.api;
+  },
+  // 每一次调用 fetch 从服务器拉取集合的模型数据时，parse都会被调用
+  parse: function (res, options) {
+    return res.list; // 这里要注意，服务端返回的数据格式是 list: [{}, {}, {}]
+  }
+})


/****************** main ********************/

+let BookModel = BaseModel.extend({
+  api: 'book',
+})
    
+let BookCollection = BaseCollection.extend({
+  model: BookModel,
+})

+let BookItemView = Backbone.View.extend({
+  // 使用 underscore 的模板渲染
+  _template: _.template($('#bookItemTemplate').html()),
+  // 监听 model 的 change 和 destroy 事件, 执行相应的方法
+  initialize: function () { 
+    this.listenTo(this.model, 'destroy', this.remove);
+    this.listenTo(this.model, 'change', this.render);
+  },
+  events: {
+    'click #btn-delete': 'handleDelete'
+  },
+  render: function () {
+    let json = this.model.toJSON();
+    this.$el.html(this._template(json));
+    return this;
+  },
+  handleDelete: function (e) {
+    e.preventDefault();
+    this.model.destroy();
+  }
+});

+let BookCollectionView = Backbone.View.extend({
+  subView: BookItemView,
+  initialize: function () {
+    this.listenTo(this.collection, 'reset', this.render);
+    this.listenTo(this.collection, 'add', this.addOneBook);
+    this._views = []
+  },
+  createSubView: function (model) {
+    let viewClass = this.subView || Backbone.View;
+    let v = new viewClass({model: model}); // 创建每一本书的子类并绑定model
+    this._views.push(v);
+    return v;
+  },
+  // 添加每一本书到书籍列表视图中
+  addOneBook: function (model) {
+    this.$el.append(this.createSubView(model).render().$el)
+  },
+  // 清空 views 中的数据，重新遍历书籍集合
+  render: function () {
+    _.each(this._views, function (itemView) {
+      itemView.remove().off();
+    });
+    this._views = [];
+    if (!this.collection) return this;
+    this.collection.each((model) => {
+      this.addOne(model);
+    });
+  },
+})

// 书籍列表页
let BookListPage = BookPage.extend({
  el: '#bookListBox',
+ // 实例初始化，通过get请求书籍列表，重置集合并渲染视图
+ initialize: function () {
+   this.bookCollection = new BookCollection();
+   this.bookCollectionView = new BookCollectionView({
+     collection: this.bookCollection,
+     el: '#bookListContent'
+   })
+   this.bookCollection.fetch({reset: true});
+ }
})

// 新增书籍页
let CreateBookPage = BookPage.extend({
  el: '#createBook',
})

// 修改书籍页
let EditBookPage = BookPage.extend({
  el: '#editBook',
})

let AppRouter = Backbone.Router.extend({
  initialize: function () {
    this.bookListPage = new BookListPage();
    this.createBookPage = new CreateBookPage();
    this.editBookPage = new EditBookPage();
  },
  routes: {
    'create': 'createBook',
    'edit/:id': 'editBook',
    '': 'bookList',
  },
  bookList: function () {
    this.editBookPage.hide();
    this.createBookPage.hide();
    this.bookListPage.show();
  },
  createBook: function () {
    this.bookListPage.hide();
    this.editBookPage.hide();
    this.createBookPage.show();
  },
  editBook: function (id) {
    this.bookListPage.hide();
    this.createBookPage.hide();
    this.editBookPage.show();
  }
})

// 创建路由实例
let app = new AppRouter();

// 当所有的 Routers 创建并设置完毕，调用 Backbone.history.start() 开始监控 hashchange 事件并分配路由
Backbone.history.start()
```



列表展示页完成，继续完成新增书籍页面

```javascript
// js/app/main.js

/******************* 基类 *******************/
let BookPage = Backbone.View.extend({
  hide: function () {
    this.$el.hide()
  },
  show: function () {
    this.$el.show()
  }
});

let BaseModel = Backbone.Model.extend({
  api: '',
  //通过指定 urlRoot 来设置生成基于模型 id 的 URLs 的默认 url 函数
  urlRoot: function () {
    return 'http://127.0.0.1:3000/' + this.api;
  }
});

let BaseCollection = Backbone.Collection.extend({
  //设置 url 属性（或函数）以指定集合对应的服务器位置
  url: function () {
    return 'http://127.0.0.1:3000/' + this.model.prototype.api;
  },
  // 每一次调用 fetch 从服务器拉取集合的模型数据时，parse都会被调用
  parse: function (res, options) {
    return res.list; // 这里要注意，服务端返回的数据格式是 list: [{}, {}, {}]
  }
})

/****************** main ********************/

let BookModel = BaseModel.extend({
  api: 'book',
})

let BookCollection = BaseCollection.extend({
  model: BookModel,
})

let BookItemView = Backbone.View.extend({
  // 使用 underscore 的模板渲染
  _template: _.template($('#bookItemTemplate').html()),
  // 监听 model 的 change 和 destroy 事件, 执行相应的方法
  initialize: function () { 
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'change', this.render);
  },
  events: {
    'click #btn-delete': 'handleDelete'
  },
  render: function () {
    let json = this.model.toJSON();
    this.$el.html(this._template(json));
    return this;
  },
  handleDelete: function (e) {
    e.preventDefault();
    this.model.destroy();
  }
});

let BookCollectionView = Backbone.View.extend({
  subView: BookItemView,
  initialize: function () {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOneBook);
    this._views = []
  },
  createSubView: function (model) {
    let viewClass = this.subView || Backbone.View;
    let v = new viewClass({model: model}); // 创建每一本书的子类并绑定model
    this._views.push(v);
    return v;
  },
  // 添加每一本书到书籍列表视图中
  addOneBook: function (model) {
    this.$el.append(this.createSubView(model).render().$el)
  },
  // 清空 views 中的数据，重新遍历书籍集合
  render: function () {
    _.each(this._views, function (itemView) {
      itemView.remove().off();
    });
    this._views = [];
    if (!this.collection) return this;
    this.collection.each((model) => {
      this.addOne(model);
    });
  },
})

// 书籍列表页
let BookListPage = BookPage.extend({
  el: '#bookListBox',
  // 实例初始化，通过get请求书籍列表，重置集合并渲染视图
  initialize: function () {
    this.bookCollection = new BookCollection();
    this.bookCollectionView = new BookCollectionView({
      collection: this.bookCollection,
      el: '#bookListContent'
    })
    this.bookCollection.fetch({reset: true});
  }
})

// 公共表单组件
+let BookFormPage = BookPage.extend({
+  template: _.template($('#bookForm').html()),
+  _initialize: function (options) {
+    this.router = options.router;
+    this.collection = options.collection || [];
+    this.model = options.model || {};
+    this.$el.html(this.template({}))
+  },
+  events: {
+    'click #btn-edit-save': 'handleEdit',
+  },
+  handleEdit: function (e) {
+    e.preventDefault();
+    let bookInfo = this.$el.serializeArray();
+    let data = {};
+    bookInfo.forEach(item => {
+      data[item.name] = item.value
+    })
+    let currentRoute = Backbone.history.getFragment();
+    if (currentRoute === 'create') {  // 新增
+      let newBook = new BookModel(data)
+      // 这里要使用集合的create方法，将数据添加到数据库中并返回该条数据，渲染到前端页面中
+      this.collection.create(newBook, {wait: true})
+      this.router.navigate('', {trigger: true})
+    }
+  }
+})

// 新增书籍页
let CreateBookPage = BookPage.extend({
  el: '#createBook',
+ initialize: function (options) {
+   this.render(options)
+ },
+ render: function (options) {
+   // 将表单挂载到 id 为 createBookForm 的节点里
+   let formPage = new BookFormPage({
+     el: '#createBookForm'
+   })
+   formPage._initialize(options)
+ },
})

// 修改书籍页
let EditBookPage = BookPage.extend({
  el: '#editBook',
})

let AppRouter = Backbone.Router.extend({
  initialize: function () {
    this.bookListPage = new BookListPage();
    this.createBookPage = new CreateBookPage({
+     router: this,
+     collection: this.bookListPage.bookCollection
    });
    this.editBookPage = new EditBookPage();
  },
  routes: {
    'create': 'createBook',
    'edit/:id': 'editBook',
    '': 'bookList',
  },
  bookList: function () {
    this.editBookPage.hide();
    this.createBookPage.hide();
    this.bookListPage.show();
  },
  createBook: function () {
    this.bookListPage.hide();
    this.editBookPage.hide();
    this.createBookPage.show();
  },
  editBook: function (id) {
    this.bookListPage.hide();
    this.createBookPage.hide();
    this.editBookPage.show();
  }
})

// 创建路由实例
let app = new AppRouter();

// 当所有的 Routers 创建并设置完毕，调用 Backbone.history.start() 开始监控 hashchange 事件并分配路由
Backbone.history.start()
```

以下是修改书籍页部分

```javascript
// js/app/main.js

/******************* 基类 *******************/
let BookPage = Backbone.View.extend({
  hide: function () {
    this.$el.hide()
  },
  show: function () {
    this.$el.show()
  }
});

let BaseModel = Backbone.Model.extend({
  api: '',
  //通过指定 urlRoot 来设置生成基于模型 id 的 URLs 的默认 url 函数
  urlRoot: function () {
    return 'http://127.0.0.1:3000/' + this.api;
  }
});

let BaseCollection = Backbone.Collection.extend({
  //设置 url 属性（或函数）以指定集合对应的服务器位置
  url: function () {
    return 'http://127.0.0.1:3000/' + this.model.prototype.api;
  },
  // 每一次调用 fetch 从服务器拉取集合的模型数据时，parse都会被调用
  parse: function (res, options) {
    return res.list; // 这里要注意，服务端返回的数据格式是 list: [{}, {}, {}]
  }
})

/****************** main ********************/

let BookModel = BaseModel.extend({
  api: 'book',
})

let BookCollection = BaseCollection.extend({
  model: BookModel,
})

let BookItemView = Backbone.View.extend({
  // 使用 underscore 的模板渲染
  _template: _.template($('#bookItemTemplate').html()),
  // 监听 model 的 change 和 destroy 事件, 执行相应的方法
  initialize: function () { 
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'change', this.render);
  },
  events: {
    'click #btn-delete': 'handleDelete'
  },
  render: function () {
    let json = this.model.toJSON();
    this.$el.html(this._template(json));
    return this;
  },
  handleDelete: function (e) {
    e.preventDefault();
    this.model.destroy();
  }
});

let BookCollectionView = Backbone.View.extend({
  subView: BookItemView,
  initialize: function () {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOneBook);
    this._views = []
  },
  createSubView: function (model) {
    let viewClass = this.subView || Backbone.View;
    let v = new viewClass({model: model}); // 创建每一本书的子类并绑定model
    this._views.push(v);
    return v;
  },
  // 添加每一本书到书籍列表视图中
  addOneBook: function (model) {
    this.$el.append(this.createSubView(model).render().$el)
  },
  // 清空 views 中的数据，重新遍历书籍集合
  render: function () {
    _.each(this._views, function (itemView) {
      itemView.remove().off();
    });
    this._views = [];
    if (!this.collection) return this;
    this.collection.each((model) => {
      this.addOne(model);
    });
  },
})

// 书籍列表页
let BookListPage = BookPage.extend({
  el: '#bookListBox',
  // 实例初始化，通过get请求书籍列表，重置集合并渲染视图
  initialize: function () {
    this.bookCollection = new BookCollection();
    this.bookCollectionView = new BookCollectionView({
      collection: this.bookCollection,
      el: '#bookListContent'
    })
    this.bookCollection.fetch({reset: true});
  }
})

// 公共表单组件
let BookFormPage = BookPage.extend({
  template: _.template($('#bookForm').html()),
  _initialize: function (options) {
    this.router = options.router;
    this.collection = options.collection || [];
    this.model = options.model || {};
    this.$el.html(this.template({}))
  },
  events: {
    'click #btn-edit-save': 'handleEdit',
  },
  handleEdit: function (e) {
    e.preventDefault();
    let bookInfo = this.$el.serializeArray();
    let data = {};
    bookInfo.forEach(item => {
      data[item.name] = item.value
    })
    let currentRoute = Backbone.history.getFragment();
+   let [editRoute, id] = currentRoute.split('/')
    if (currentRoute === 'create') {  // 新增
      let newBook = new BookModel(data)
      // 这里要使用集合的create方法，将数据添加到数据库中并返回该条数据，渲染到前端页面中
      this.collection.create(newBook, {wait: true})
      this.router.navigate('', {trigger: true})
+   } else if (editRoute === 'edit' && Number(id) === this.model.id) {  // 修改
+     this.model.set(data);
+     this.model.save();
+     this.router.navigate('', {trigger: true})
    }
  }
})

// 新增书籍页
let CreateBookPage = BookPage.extend({
  el: '#createBook',
  initialize: function (options) {
    this.render(options)
  },
  render: function (options) {
    // 将表单挂载到 id 为 createBookForm 的节点里
    let formPage = new BookFormPage({
      el: '#createBookForm'
    })
    formPage._initialize(options)
  },
})

// 修改书籍页
let EditBookPage = BookPage.extend({
  el: '#editBook',
+ initialize: function (options) {
+   this.router = options.router;
+ },
+ show: function (book) {
+   if (book) {
+     this.model = book;
+     this.render()
+   }
+   this.$el.show();
+ },
+ render: function () {
+   let formPage = new BookFormPage({
+     el: '#editBookForm'
+   })
+   formPage._initialize({router: this.router, model: this.model})
+   let json = this.model.toJSON();
+   let editBookForm = $('#editBookForm');
+   editBookForm.find('#edit-isbn').val(json.isbn);
+   editBookForm.find('#edit-book-name').val(json.book_name);
+   editBookForm.find('#edit-author').val(json.author);
+   editBookForm.find('#edit-cover').val(json.book_cover);
+ },
})

let AppRouter = Backbone.Router.extend({
  initialize: function () {
    this.bookListPage = new BookListPage();
    this.createBookPage = new CreateBookPage({
      router: this,
      collection: this.bookListPage.bookCollection
    });
    this.editBookPage = new EditBookPage({
+     router: this
    });
  },
  routes: {
    'create': 'createBook',
    'edit/:id': 'editBook',
    '': 'bookList',
  },
  bookList: function () {
    this.editBookPage.hide();
    this.createBookPage.hide();
    this.bookListPage.show();
  },
  createBook: function () {
    this.bookListPage.hide();
    this.editBookPage.hide();
    this.createBookPage.show();
  },
  editBook: function (id) {
    this.bookListPage.hide();
    this.createBookPage.hide();
+   let book = this.bookListPage.bookCollection.find(function (model) {
+     return model.id === Number(id);
+   })
+   this.editBookPage.show(book);
  }
})

// 创建路由实例
let app = new AppRouter();

// 当所有的 Routers 创建并设置完毕，调用 Backbone.history.start() 开始监控 hashchange 事件并分配路由
Backbone.history.start()
```
