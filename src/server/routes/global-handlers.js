export function error(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).send({
            status: 400,
            message: err.message
        })
    }

    if (err.status === 404) {
        return next()
    }

    let error = {
        message: err.message || "Oops!",
        status: err.status || 500,
        ...err
    }

    res.status(error.status).send(error) 
}

export function notFound(req, res) {
    res.status(404).end()
}
