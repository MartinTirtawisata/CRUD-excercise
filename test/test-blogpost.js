const chai_test = require("chai");
const chai_http = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const i_expect = chai.expect;

chai.use(chai_http);

describe("Blog-post content", function(){
    before(function(){
        //before = runs this code before anything else in this block
        return runServer();
    });

    after(function(){
        //after = run this block after anything else in this block
        return closeServer();
    });


    
});