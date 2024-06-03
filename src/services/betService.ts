import axiosBetInstance from "./axiosBetInstance";

const betService = {
  async getFilterData(table: string, queryObject: object) {
    const res = await axiosBetInstance.post(table + `/filter`, queryObject);
    return res.status == 200 ? JSON.parse(res.data.message).data : {};
  },
  async addBidding(data: object) {
    const res = await axiosBetInstance.post(`/bids`, data);
    return res.status == 200 ? JSON.parse(res.data.message).data : {};
  }
}

export default betService;