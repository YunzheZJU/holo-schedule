const liveTypeValidator = (value) => {
  return ['ended', 'current', 'scheduled'].indexOf(value) !== -1
}

export {
  liveTypeValidator,
}