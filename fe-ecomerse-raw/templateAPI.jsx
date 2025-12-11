import { useEffect, useState } from 'react';
import axios from 'axios';

const CN_BASE = 'https://countriesnow.space/api/v0.1';

export default function AddressSelector() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  /* 1️⃣ nạp danh sách quốc gia (một lần) */
  useEffect(() => {
    axios.get(`${CN_BASE}/countries/iso`).then((res) =>
      setCountries(
        res.data.data // [{name:'Afghanistan', Iso2:'AF'}, …]
          .map((c) => c.name)
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }, []);

  /* 2️⃣ khi chọn quốc gia → lấy cities */
  useEffect(() => {
    if (!country) return;

    setCities([]);
    setCity('');
    setDistricts([]);

    axios.post(`${CN_BASE}/countries/cities`, { country }).then((res) =>
      setCities(
        res.data.data.sort((a, b) => a.localeCompare(b)) // ["Hanoi","Ho Chi Minh",…]
      )
    );
  }, [country]);

  /* 3️⃣ khi chọn city → nếu VN thì show quận/huyện */
  useEffect(() => {
    if (!city) return;
    setDistricts([]);

    if (country === 'Vietnam') {
      axios.get('https://provinces.open-api.vn/api/?depth=2').then((res) => {
        const province = res.data.find((p) => p.name.includes(city));
        if (province) {
          setDistricts(province.districts.map((d) => d.name));
        }
      });
    }
  }, [city, country]);

  return (
    <>
      {/* Country */}
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">-- chọn quốc gia --</option>
        {countries.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {/* City / Province */}
      <select
        disabled={!cities.length}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      >
        <option value="">-- chọn thành phố / tỉnh --</option>
        {cities.map((cty) => (
          <option key={cty}>{cty}</option>
        ))}
      </select>

      {/* District (VN only) */}
      <select disabled={!districts.length}>
        <option value="">-- chọn quận / huyện --</option>
        {districts.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
    </>
  );
}
