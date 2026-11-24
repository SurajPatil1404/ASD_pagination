const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index');

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /search', () => {
  it('should return a 400 error if the "name" parameter is missing', (done) => {
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

  it('should return paginated results for a valid search (defaults)', (done) => {
    chai.request(app)
      .get('/search?name=node')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 1);
        expect(res.body).to.have.property('totalPages', 2);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.be.an('array').with.lengthOf(5);
        expect(res.body.articles[0]).to.have.property('title', 'Introduction to Node.js');
        done();
      });
  });

  it('should handle case-insensitive searches', (done) => {
    chai.request(app)
      .get('/search?name=NODE')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.be.an('array').with.lengthOf(5);
        expect(res.body.articles[0]).to.have.property('title', 'Introduction to Node.js');
        done();
      });
  });

  it('should respect the "limit" parameter', (done) => {
    chai.request(app)
      .get('/search?name=node&limit=2')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 1);
        expect(res.body).to.have.property('totalPages', 4);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.be.an('array').with.lengthOf(2);
        done();
      });
  });

  it('should respect the "page" parameter', (done) => {
    chai.request(app)
      .get('/search?name=node&limit=2&page=2')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 2);
        expect(res.body).to.have.property('totalPages', 4);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.be.an('array').with.lengthOf(2);
        expect(res.body.articles[0]).to.have.property('id', 6);
        done();
      });
  });

  it('should return an empty array for a page with no results', (done) => {
    chai.request(app)
      .get('/search?name=node&limit=5&page=5')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('currentPage', 5);
        expect(res.body).to.have.property('totalPages', 2);
        expect(res.body).to.have.property('totalResults', 8);
        expect(res.body.articles).to.be.an('array').that.is.empty;
        done();
      });
  });

  it('should handle searches with no matching results', (done) => {
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
});
