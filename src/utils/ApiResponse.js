class ApiResponse {
    constructor(status, message= "SUCCESS", data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}

export { ApiResponse };       