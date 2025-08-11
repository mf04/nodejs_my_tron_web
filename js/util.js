export const reqestWrapper = (data, msg = "success", code = 200) => {
    return {
        code,
        msg,
        data,
    }
}