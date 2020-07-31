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
    return 'http://192.168.12.124:3000/' + this.api;
  }
});

let BaseCollection = Backbone.Collection.extend({
  //设置 url 属性（或函数）以指定集合对应的服务器位置
  url: function () {
    return 'http://192.168.12.124:3000/' + this.model.prototype.api;
  },
  // 每一次调用 fetch 从服务器拉取集合的模型数据时，parse都会被调用
  parse: function (res, options) {
    if (res && res.list) return res.list;
    return res;
  }
})

let BaseCollectionView = Backbone.View.extend({
  subView: null,

  _initialize: function () {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOneBook);
    this._views = []
  },

  createSubView: function (model) {
    let viewClass = this.subView || Backbone.View;
    let v = new viewClass({model: model});
    this._views.push(v);
    return v;
  },

  addOneBook: function (model) {
    this.$el.append(this.createSubView(model).render().$el)
  },

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


/****************** main ********************/

let BookModel = BaseModel.extend({
  api: 'book',
})

let BookCollection = BaseCollection.extend({
  model: BookModel,
})

let BookItemView = Backbone.View.extend({
  _template: _.template($('#bookItemTemplate').html()),
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

let BookCollectionView = BaseCollectionView.extend({
  subView: BookItemView,
  initialize: function () {
    this._initialize();
  }
})

// 书籍列表页
let BookListPage = BookPage.extend({
  el: '#bookListBox',
  initialize: function () {
    this.bookCollection = new BookCollection();
    this.bookCollectionView = new BookCollectionView({
      collection: this.bookCollection,
      el: '#bookListContent'
    })
    this.bookCollection.fetch({reset: true});
  }
})

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
    let [editRoute, id] = currentRoute.split('/')
    if (currentRoute === 'create') {  // 新增
      let newBook = new BookModel(data)
      this.collection.create(newBook, {wait: true})
      this.router.navigate('', {trigger: true})
    } else if (editRoute === 'edit' && Number(id) === this.model.id) {  // 修改
      this.model.set(data);
      this.model.save();
      this.router.navigate('', {trigger: true})
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
    let formPage = new BookFormPage({
      el: '#createBookForm'
    })
    formPage._initialize(options)
  },
})

// 修改书籍页
let EditBookPage = BookPage.extend({
  el: '#editBook',
  initialize: function (options) {
    this.router = options.router;
  },
  show: function (book) {
    if (book) {
      this.model = book;
      this.render()
    }
    this.$el.show();
  },
  render: function () {
    let formPage = new BookFormPage({
      el: '#editBookForm'
    })
    formPage._initialize({router: this.router, model: this.model})
    let json = this.model.toJSON();
    let editBookForm = $('#editBookForm');
    editBookForm.find('#edit-isbn').val(json.isbn)
    editBookForm.find('#edit-book-name').val(json.book_name)
    editBookForm.find('#edit-author').val(json.author)
    editBookForm.find('#edit-cover').val(json.book_cover)
  },
})

let AppRouter = Backbone.Router.extend({
  initialize: function () {
    this.bookListPage = new BookListPage();
    this.createBookPage = new CreateBookPage({
      router: this,
      collection: this.bookListPage.bookCollection
    });
    this.editBookPage = new EditBookPage({
      router: this
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
    let book = this.bookListPage.bookCollection.find(function (model) {
      return model.id === Number(id);
    })
    this.editBookPage.show(book);
  }
})

let app = new AppRouter();

Backbone.history.start()