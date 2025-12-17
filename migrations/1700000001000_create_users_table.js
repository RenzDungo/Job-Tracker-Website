exports.up = pgm => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    email: {
      type: "text",
      notNull: true,
      unique: true,
    },
    password: {
      type: "text",
      notNull: true,
    },
  });
};

exports.down = pgm => {
  pgm.dropTable("users");
};
