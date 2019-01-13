var sanitizeHtml = require('sanitize-html');
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template');
var path = require('path');


var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname == '/') {
    if (queryData.id === undefined) {

      fs.readdir('./data', function (error, filelist) {        
        var description = 'Hello, Node.js';
        var title = "Welcome";
        /*var list = templateList(filelist);
        var template = templateHTML(title, list,
           `<h2>${title}</h2>${description}`, 
           `<a href="/create">CREATE</a>`); 
        response.writeHead(200);
        response.end(template);
      });*/
      var list = template.List(filelist);
        var html = template.HTML(title, list,
           `<h2>${title}</h2>${description}`,
           `<a href="/create">CREATE</a>`); 
        response.writeHead(200);
        response.end(html);
      });
    } else {
      // ID 값이 있는 경우
      fs.readdir('./data', function (error, filelist) {
        var filteredId = path.parse(queryData.id).base
        fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
          var title = queryData.id;
          var list = template.List(filelist);
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['h1']
          })
          var html = template.HTML(sanitizedTitle, list, 
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            `<a href="/create">CREATE</a>
            <a href="/update?id=${sanitizedTitle}">UPDATE</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>
            `
          );
          response.writeHead(200);
          response.end(html);
        });
      });

    }
  } else if (pathname === '/create') {
    fs.readdir('./data', function(error, filelist) {        
      var title = "WEB - create";
      var list = template.List(filelist);
      var html = template.HTML(title, list,`
      <form action="/create_process" method="post">
      <p><input type="text" name = "title" placeholder="title"></p>
      <p>
          <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
          <input type="submit">
      </p>
      </form>
      `,'');
      response.writeHead(200);
      response.end(html);
    });

  } else if (pathname === '/create_process') {
    body = '';

    // post로 오는 데이터가 많을 경우를 대비, 너무 많으면 끊음
    request.on('data', function(data) { 
      body = body + data;

      // if (body.length > 1e6) 

    });
    // 들어오는 데이터가 없으면, end callback 호출
    request.on('end', function() {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;

      // 파일 생성.
      fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      });
    })
    
  } else if(pathname ==='/update') {
    fs.readdir('./data', function(error, filelist) {
      var filteredId = path.parse(queryData.id).base
      fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = queryData.id;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description);
        var list = template.List(filelist);
        var html = template.HTML(sanitizedTitle, list, 
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
          <p><input type="text" name = "title" placeholder="title" value="${sanitizedTitle}"></p>
          <p>
              <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
          </p>
          <p>
              <input type="submit">
          </p>
          </form>          
          `,
          `<a href="/create">CREATE</a> <a href="/update?id=${sanitizedTitle}">UPDATE</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if(pathname === '/update_process') {
    // UPDATE 실행
    var body = '';
    
    request.on('data', function(data) { 
      body = body + data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;

      // 파일명 변경
      fs.rename(`data/${id}`, `data/${title}`, function(error) {
        // 파일 생성.
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        });
      });
      
    })
  } else if(pathname === '/delete_process') {
    // DELETE 실행
    var body = '';    
    request.on('data', function(data) { 
      body = body + data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base
      fs.unlink(`data/${filteredId}`, function(error) {
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    })
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }

});
app.listen(3000);