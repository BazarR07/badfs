"use strict";

module.exports = function (app) {
  const Issue = require("../routes/Issuemodel");

  app
    .route("/api/issues/:project")

    .get((req, res) => {
      let project = req.params.project;

      Issue.find({ project: project })
        .then((data) => {
          if (req.query._id) {
            data = data.filter((d) => d._id.toString() === req.query._id);
          }
          if (req.query.issue_title) {
            data = data.filter((d) => d.issue_title === req.query.issue_title);
          }
          if (req.query.issue_text) {
            data = data.filter((d) => d.issue_text === req.query.issue_text);
          }
          if (req.query.created_on) {
            data = data.filter((d) => d.created_on === req.query.created_on);
          }
          if (req.query.updated_on) {
            data = data.filter((d) => d.updated_on === req.query.updated_on);
          }
          if (req.query.created_by) {
            data = data.filter((d) => d.created_by === req.query.created_by);
          }
          if (req.query.assigned_to) {
            data = data.filter((d) => d.assigned_to === req.query.assigned_to);
          }
          if (req.query.status_text) {
            data = data.filter((d) => d.status_text === req.query.status_text);
          }
          if (req.query.open) {
            if (req.query.open === "true") {
              data = data.filter((d) => d.open === true);
            } else if (req.query.open === "false") {
              data = data.filter((d) => d.open === false);
            } else return res.json({ error: "query:open must be true or false" });
          }
          res.json(data);
        })
        .catch((err) => console.log(err));
    })

    .post(async function (req, res) {
      let project = req.params.project;

      let issue = new Issue({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date().toDateString(),
        updated_on: new Date().toDateString(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        open: true,
        status_text: req.body.status_text || "",
      });

      try {
        const data = await issue.save();
        res.json({
          _id: data._id,
          issue_title: data.issue_title,
          issue_text: data.issue_text,
          created_on: data.created_on,
          updated_on: data.updated_on,
          created_by: data.created_by,
          assigned_to: data.assigned_to,
          open: data.open,
          status_text: data.status_text,
        });
      } catch (err) {
        res.json({ error: "required field(s) missing" });
      }
    })

    .put(function (req, res) {
      let project = req.params.project;

      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }

      let updatedIssue = {};

      if (req.body.issue_title) {
        updatedIssue.issue_title = req.body.issue_title;
      }

      if (req.body.issue_text) {
        updatedIssue.issue_text = req.body.issue_text;
      }

      if (req.body.created_by) {
        updatedIssue.created_by = req.body.created_by;
      }
      if (req.body.assigned_to) {
        updatedIssue.assigned_to = req.body.assigned_to;
      }
      if (req.body.open === false) {
        updatedIssue.open = req.body.open;
      }
      if (req.body.status_text) {
        updatedIssue.status_text = req.body.status_text;
      }

      if (Object.keys(updatedIssue).length === 0) {
        return res.json({
          error: "no update field(s) sent",
          _id: req.body._id,
        });
      }

      updatedIssue.updated_on = new Date().toISOString();

      Issue.findByIdAndUpdate(req.body._id, updatedIssue, { new: true })
        .then((data) => {
          if (!data) {
            return res.json({ error: "could not update", _id: req.body._id });
          }
          res.json({ result: "successfully updated", _id: req.body._id });
        })
        .catch((err) => {
          res.json({ error: "could not update", _id: req.body._id });
        });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }

      Issue.findByIdAndDelete(req.body._id)
        .then((data) => {
          if (!data) {
            return res.json({ error: "could not delete", _id: req.body._id });
          }
          res.json({ result: "successfully deleted", _id: req.body._id });
        })
        .catch((err) => {
          res.json({ error: "could not delete", _id: req.body._id });
        });
    });
};
