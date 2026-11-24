const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index');

chai.use(chaiHttp);
const { expect } = chai;

describe('Article Search API with Pagination', () => {
  it('should return 400 if name query parameter is missing', (done) => {
    chai.request(app)
      .get('/search')
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          error: 'Search name parameter is required.'
        });
        done();
      });
  });

  it('should return 400 if name query parameter is empty', (done) => {
    chai.request(app)
      .get('/search?name=')
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          error: 'Search name parameter is required.'
        });
        done();
      });
  });

  it('should return 400 if name query parameter contains only whitespace', (done) => {
    chai.request(app)
      .get('/search?name=   ')
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          error: 'Search name parameter is required.'
        });
        done();
      });
  });

  it('should return matching articles with default pagination (limit=5, page=1)', (done) => {
    chai.request(app)
      .get('/search?name=programming')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 1);
        expect(res.body).to.have.property('totalPages', 1);
        expect(res.body).to.have.property('totalResults', 1);
        expect(res.body).to.have.property('articles').that.is.an('array').with.lengthOf(1);
        expect(res.body.articles[0]).to.deep.include({
          id: 10,
          title: 'Functional Programming in JavaScript',
          author: 'Peter Pan'
        });
        done();
      });
  });

  it('should support case-insensitive and partial search for "node"', (done) => {
    chai.request(app)
      .get('/search?name=NODE&limit=3&page=1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 1);
        expect(res.body).to.have.property('totalPages', 3);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.have.lengthOf(3);
        expect(res.body.articles[0].title).to.equal('Introduction to Node.js');
        done();
      });
  });

  it('should return page 2 for multi-page search results', (done) => {
    chai.request(app)
      .get('/search?name=node&limit=3&page=2')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 2);
        expect(res.body).to.have.property('totalPages', 3);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.have.lengthOf(3);
        // Verify articles in page 2 are 4th, 5th, 6th matching articles (id: 9, 11, 13)
        expect(res.body.articles[0].id).to.equal(9);
        expect(res.body.articles[0].title).to.equal('Node.js Performance Optimization');
        expect(res.body.articles[1].id).to.equal(11);
        expect(res.body.articles[2].id).to.equal(13);
        done();
      });
  });

  it('should handle zero matching results correctly', (done) => {
    chai.request(app)
      .get('/search?name=nonexistent_topic')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          articles: []
        });
        done();
      });
  });

  it('should return empty results for queries like webdev', (done) => {
    chai.request(app)
      .get('/search?name=webdev&limit=2')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          articles: []
        });
        done();
      });
  });

  it('should handle query with nonexistent topic and custom page/limit', (done) => {
    chai.request(app)
      .get('/search?name=data&limit=1&page=2')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          currentPage: 2,
          totalPages: 0,
          totalResults: 0,
          articles: []
        });
        done();
      });
  });

  it('should handle query for data with limit=2&page=1', (done) => {
    chai.request(app)
      .get('/search?name=data&limit=2&page=1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          articles: []
        });
        done();
      });
  });

  it('should default invalid limit and page to 5 and 1', (done) => {
    chai.request(app)
      .get('/search?name=node&limit=-5&page=invalid')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 1);
        expect(res.body).to.have.property('totalPages', 2);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.have.lengthOf(5);
        done();
      });
  });
});
