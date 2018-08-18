const chai_test = require("chai");
const chai_http = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const i_expect = chai_test.expect;

chai_test.use(chai_http);

describe("Blog-post content", function(){
    before(function(){
        //before = runs this code before anything else in this block
        return runServer();
    });

    after(function(){
        //after = run this block after anything else in this block
        return closeServer();
    });

    it("should list blogposts on GET request", function(){
        return chai_test.request(app).get('/blogposts').then(function(res){
            // console.log(res);
            i_expect(res).to.have.status(200);
            i_expect(res).to.be.json;
            i_expect(res.body).to.be.a('array');

            i_expect(res.body.length).to.be.at.least(1);

            const iExpectedKeys = ['id', 'title','content','author','publishDate'];
            // console.log(res.body); //need to know structure of code or data
            res.body.forEach(function(key){
                i_expect(key).to.be.a('object');
                i_expect(key).to.include.keys(iExpectedKeys);
            });
        });
    });

    it("should create new blogposts on POST request", () => {
        const newBlogPost = {title: "iPhone", content: "nice", author: "Martin"}
        return chai_test.request(app).post('/blogposts').send(newBlogPost).then((res) => {
            i_expect(res).to.have.status(201);
            i_expect(res).to.be.json;
            i_expect(res.body).to.be.a('object');
            i_expect(res.body).to.include.keys('id', 'title','content','author','publishDate');
            i_expect(res.body.id).to.not.equal(null);
        });
    });
    
    it('should update blogpost on PUT', () => {
        const updateBlog = {
            title: "Alibaba",
            content: "Amazing",
            author: "Jack ma"
        };

        return chai_test.request(app).get('/blogposts').then((res) =>{
            updateBlog.id = res.body[0].id;

            return chai_test.request(app).put(`/blogposts/${updateBlog.id}`).send(updateBlog);
        })

        .then(function(res) {
            i_expect(res).to.have.status(204);

        }) 
    });

    it('should delete blogpost on DELETE',()=>{
        return chai_test
            .request(app)
            .get(`/blogposts`)
            .then(function(res){
                return chai_test.request(app).delete(`/blogposts/${res.body[0].id}`)
            })
            .then((res) => {
                i_expect(res).to.have.status(204);
            })
    });
});