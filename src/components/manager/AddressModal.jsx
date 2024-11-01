/* eslint-disable react/prop-types */
// AddressModal.js
import { useEffect, useState } from "react";
import { Button, Modal } from "antd";

const baseURL = "https://vn-public-apis.fpo.vn";

const AddressModal = ({ visible, onClose, onAddressSelected }) => {
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [wardList, setWardList] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${baseURL}/provinces/getAll?limit=-1`);
      const data = await response.json();
      setProvinceList(data.data.data || []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await fetch(
        `${baseURL}/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`
      );
      const data = await response.json();
      setDistrictList(data.data.data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistrictList([]);
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await fetch(
        `${baseURL}/wards/getByDistrict?districtCode=${districtCode}&limit=-1`
      );
      const data = await response.json();
      setWardList(data.data.data || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWardList([]);
    }
  };

  const resetFields = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setSpecificAddress("");
  };

  const handleOk = () => {
    const selectedProvinceObj = provinceList.find(
      (province) => province.code === selectedProvince
    );
    const selectedDistrictObj = districtList.find(
      (district) => district.code === selectedDistrict
    );
    const selectedWardObj = wardList.find((ward) => ward.code === selectedWard);

    const completeAddress = `${specificAddress}, ${
      selectedWardObj?.name_with_type || ""
    }, ${selectedDistrictObj?.name_with_type || ""}, ${
      selectedProvinceObj?.name_with_type || ""
    }`;

    onAddressSelected(completeAddress);
    resetFields(); // Reset fields sau khi chọn xong địa chỉ
    onClose();
  };

  return (
    <Modal
      title="Chỉnh sửa địa chỉ"
      visible={visible}
      onCancel={() => {
        resetFields();
        onClose();
      }}
      onOk={handleOk}
      width="800px"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Lưu địa chỉ
        </Button>,
      ]}
    >
      {/* Address selection form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-4">
            Tỉnh/Thành phố
          </label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedProvince}
            onChange={(e) => {
              const provinceCode = e.target.value;
              setSelectedProvince(provinceCode);
              fetchDistricts(provinceCode);
            }}
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinceList.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name_with_type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-4">
            Quận/Huyện
          </label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedDistrict}
            onChange={(e) => {
              const districtCode = e.target.value;
              setSelectedDistrict(districtCode);
              fetchWards(districtCode);
            }}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districtList.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name_with_type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-4">
            Phường/Xã
          </label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="">Chọn Phường/Xã</option>
            {wardList.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name_with_type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-10">
        <label className="block text-gray-700 font-semibold mb-4">
          Địa chỉ cụ thể
        </label>
        <input
          className="w-full px-4 py-2 border rounded-md"
          placeholder="123 Đường ABC"
          value={specificAddress}
          onChange={(e) => setSpecificAddress(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default AddressModal;
