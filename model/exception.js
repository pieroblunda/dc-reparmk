class Exception {
  constructor(sender, message, name, stack) {
    this.sender = sender;
    this.message = message;
    this.name = name;
    this.stack = stack;
  }
}

module.exports = Exception;
