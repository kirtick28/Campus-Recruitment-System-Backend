const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
};

export default catchAsync;
