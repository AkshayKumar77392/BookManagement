if (!moment(releasedAt, "YYYY-MM-DD", true).isValid())
    return res.status(400).send({
        status: false,
        message: "Enter a valid date with the format (YYYY-MM-DD).",
    });
