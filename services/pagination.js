

export function paginate({page=1, size=0}={}) {

    if (!page || page <= 0) {
        page = 1
    }

    if (!size || size <= 0) {
        size = 0
    }

    const skip = (page - 1) * size
    return { limit: size, skip }
}