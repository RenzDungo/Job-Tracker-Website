/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("jobapptable", {
    jobid: {
      type:"serial",
      primaryKey: true,
    },
    name: {
      type: "text",
      notNull: true,
    },
    position: {
      type: "text",
    },
    status: {
      type: "text",
    },
    link: {
      type: "text",
    },
    platform: {
      type: "text",
    },
    salary: {
      type: "integer",
    },
    notes: {
      type: "text",
    },
    userid: {
        type:"uuid",
        references:"users(id)",
        notNull: true,
        onDelete: 'Cascade',
    },
    month: {
      type:"integer"
    },
    day: {
      type:"integer"
    },
    year: {
      type:"integer"
    }
  });
};

exports.down = pgm => {
  pgm.dropTable("jobapptable");
};