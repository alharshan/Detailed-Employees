import React from "react";
import CirclePackingChart from "./CirclePackingChart";
import data from "./workforce_hierarchy.json"; // استيراد ملف البيانات

function App() {
  return (
    <div style={{ padding: "20px", background: "#ffffff", minHeight: "100vh" }}>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#222",
        }}
      >
        {/* لوحة مؤشرات القوى العاملة بحسب الأنشطة الاقتصادية */}
      </h1>
      <p
        style={{
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#666",
          marginBottom: "30px",
        }}
      >
        {/* اضغط على القطاعات الرئيسية للتكبير ورؤية التوزيع التفصيلي للعمالة في
        المستوى السادس */}
      </p>

      {/* استدعاء داشبورد الدوائر وتمرير البيانات له */}
      <CirclePackingChart data={data} />
    </div>
  );
}

export default App;
