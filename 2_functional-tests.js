const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Issue = require("../routes/Issuemodel");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const regexDate = /\w{3} \w{3} \d{1,2} \d{4}/;

  test("issue with every field", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "issue with every field",
        issue_text: "issue with every field",
        created_by: "issue with every field",
        assigned_to: "issue with every field",
        status_text: "issue with every field",
      })
      .end((err, res) => {
        assert.isNotNull(res.body._id);
        assert.equal(res.body.issue_title, "issue with every field");
        assert.equal(res.body.issue_text, "issue with every field");
        assert.equal(res.body.created_by, "issue with every field");
        assert.equal(res.body.assigned_to, "issue with every field");
        assert.equal(res.body.status_text, "issue with every field");
        assert.match(res.body.created_on, regexDate);
        assert.match(res.body.updated_on, regexDate);
        assert.equal(res.body.open, true);
        done();
      });
  });

  test("issue with requiered fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "issue with requiered fields",
        issue_text: "issue with requiered fields",
        created_by: "issue with requiered fields",
      })
      .end((err, res) => {
        assert.isNotNull(res.body._id);
        assert.equal(res.body.issue_title, "issue with requiered fields");
        assert.equal(res.body.issue_text, "issue with requiered fields");
        assert.equal(res.body.created_by, "issue with requiered fields");
        assert.match(res.body.created_on, regexDate);
        assert.match(res.body.updated_on, regexDate);
        assert.equal(res.body.open, true);
        done();
      });
  });

  test("Create an issue with missing required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "missing",
        issue_text: "missing",
      })
      .end((err, res) => {
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
        done();
      });
  });

  test("View issues on a project with filter", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest?open=true")
      .end((err, res) => {
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
        res.body.map((data) => {
          assert.isTrue(data.open);
        });
        done();
      });
  });

  test("View issues on a project with multiple filters", async function () {
    let issue = new Issue({
      project: "test",
      issue_title: "filter",
      issue_text: "test",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      created_by: "test",
      assigned_to: "",
      open: false,
      status_text: "",
    });

    await issue.save();

    const res = await chai
      .request(server)
      .get("/api/issues/test?issue_title=filter&open=false");

    const data = await Issue.find({ project: "test" });
    const filteredData = data.filter(
      (d) => d.issue_title === "filter" && d.open === false,
    );

    res.body.map((issue, index) => {
      assert.equal(issue._id, filteredData[index]._id);
    });
  });

  test("Update one field on an issue", (done) => {
    let issue = new Issue({
      project: "test",
      issue_title: "filter",
      issue_text: "test",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      created_by: "test",
      assigned_to: "",
      open: true,
      status_text: "",
    });

    issue.save().then((data) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: data._id,
          open: false,
        })
        .end((err, res) => {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, data._id);
          done();
        });
    });
  });

  test("Update an issue with no fields to update", function (done) {
    let issue = new Issue({
      project: "test",
      issue_title: "test",
      issue_text: "test",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      created_by: "test",
      assigned_to: "",
      open: true,
      status_text: "",
    });

    issue.save().then((data) => {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: data._id,
        })
        .end((err, res) => {
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, data._id);
          done();
        });
    });
  });

  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: "INVALID_ID",
        open: false,
      })
      .end((err, res) => {
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "INVALID_ID");
        done();
      });
  });

  test("Update an issue with missing _id", async function () {
    let issue = new Issue({
      project: "test",
      issue_title: "test",
      issue_text: "test",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      created_by: "test",
      assigned_to: "",
      open: true,
      status_text: "",
    });

    await issue.save();
    const res = await chai.request(server).put("/api/issues/test").send({
      open: false,
    });
    assert.equal(res.body.error, "missing _id");
  });

  test("Update multiple fields on an issue", async function () {
    let issue = new Issue({
      project: "test",
      issue_title: "test",
      issue_text: "test",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      created_by: "test",
      assigned_to: "",
      open: true,
      status_text: "",
    });

    const data = await issue.save();
    const res = await chai.request(server).put("/api/issues/test").send({
      _id: data._id,
      issue_title: "updated",
      issue_text: "updated",
      created_by: "updated",
      assigned_to: "updated",
      open: false,
      status_text: "updated",
    });

    assert.equal(res.body.result, "successfully updated");
    assert.equal(res.body._id, data._id);
  });
  test("Delete an issue", async function () {
    let issue = new Issue({
      project: "test",
      issue_title: "test",
      issue_text: "test",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      created_by: "test",
      assigned_to: "",
      open: true,
      status_text: "",
    });

    const data = await issue.save();
    const res = await chai
      .request(server)
      .delete("/api/issues/test")
      .send({ _id: data._id });

    assert.equal(res.body.result, "successfully deleted");
    assert.equal(res.body._id, data._id);
  });

  test("Delete an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: "INVALID_ID",
      })
      .end((err, res) => {
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "INVALID_ID");
        done();
      });
  });

  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end((err, res) => {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
