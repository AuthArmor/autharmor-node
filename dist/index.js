"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const ws_1 = __importDefault(require("ws"));
const config_1 = __importDefault(require("./config"));
const defaultAuthConfig = {
    timeout_in_seconds: 60,
    action_name: "Login",
    short_msg: "Someone is trying to login using your Auth Armor account"
};
class AuthArmorSDK {
    constructor({ clientId, clientSecret, server, polling = false }) {
        this.clientId = "";
        this.clientSecret = "";
        this.tokenExpiration = Date.now();
        this.token = null;
        this.websockets = {};
        this.init({ clientId, clientSecret, server, polling });
    }
    init({ clientId, clientSecret, server, polling = false }) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        if (!polling && server) {
            const socketServer = new ws_1.default.Server({
                server,
                path: "/auth/autharmor/socket",
                noServer: !server
            });
            socketServer.on("connection", socket => {
                socket.on("message", data => {
                    try {
                        if (typeof data !== "string") {
                            return;
                        }
                        const parsedData = JSON.parse(data);
                        if (parsedData.event === "subscribe:auth") {
                            this.websockets = Object.assign(Object.assign({}, this.websockets), { [parsedData.data.requestId]: [
                                    ...this.websockets[parsedData.data.authId],
                                    socket
                                ] });
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                });
            });
        }
    }
    emitSockets({ id, data }) {
        const sockets = this.websockets[id] || [];
        sockets.map(socket => socket.send(JSON.stringify(data)));
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(() => resolve(true), ms));
    }
    verifyToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tokenExpiration <= Date.now() + 2 * 60 * 1000) {
                const { data: accessToken } = yield axios_1.default.post(`${config_1.default.loginURL}/connect/token`, querystring_1.default.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: "client_credentials"
                }));
                this.token = accessToken;
                this.tokenExpiration = Date.now() + 8 * 60 * 1000;
            }
        });
    }
    pollRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${config_1.default.apiUrl}/auth/request/${request.auth_request_id}`);
            if (data.auth_request_status_name !== "Pending") {
                this.emitSockets({
                    id: request.auth_request_id,
                    data: {
                        event: "auth:response",
                        data
                    }
                });
                return;
            }
            yield this.wait(500);
            this.pollRequest(request);
        });
    }
    authenticate(authConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.verifyToken();
                const { data } = yield axios_1.default.post(`${config_1.default.apiUrl}/auth/request/async`, Object.assign(Object.assign({}, defaultAuthConfig), authConfig), {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.pollRequest(data);
                return data;
            }
            catch (err) {
                throw err.response.data;
            }
        });
    }
    invite({ nickname, referenceId }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyToken();
            const { data } = yield axios_1.default.post(`${config_1.default.apiUrl}/invite/request`, {
                nickname: nickname,
                referenceId: referenceId
            }, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            return data;
        });
    }
}
exports.default = AuthArmorSDK;
