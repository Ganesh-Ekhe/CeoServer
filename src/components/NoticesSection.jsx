
import { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineAnnouncement } from "react-icons/md"; // optional icon (npm i react-icons)

const NoticesSection = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notices");
        setNotices(res.data);
      } catch (error) {
        console.error("Failed to fetch notices", error);
      }
    };

    fetchNotices();
  }, []);

  return (
    <section className="bg-white py-10 px-4 md:px-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        📰 Latest Notices
      </h2>

      <ul className="max-w-4xl mx-auto space-y-4">
        {notices.length === 0 ? (
          <li className="text-center text-gray-500">
            No notices available at the moment.
          </li>
        ) : (
          notices.map((notice) => (
            <li
              key={notice._id}
              className="flex items-start gap-3 p-4 bg-gray-100 hover:bg-blue-100 transition-colors rounded-xl shadow-md"
            >
              <span className="text-blue-500 mt-1 text-xl">
                <MdOutlineAnnouncement />
              </span>
              <p className="text-gray-800 font-medium">{notice.title}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default NoticesSection;
