export function ToolPerformance() {
  const tools = [
    {
      status: "OVERDUE",
      name: "Bosch Maintenance",
      toolNo: "3456789",
      category: "Calibration",
    },
    {
      status: "UPCOMING",
      name: "Drill Chuck Change",
      toolNo: "3456789",
      category: "Calibration",
    },
    {
      status: "UPCOMING",
      name: "Tool Programmer",
      toolNo: "3456789",
      category: "Calibration",
    },
    {
      status: "UPCOMING",
      name: "Tool Chuck Change",
      toolNo: "3456789",
      category: "Calibration",
    },
    {
      status: "COMPLETED",
      name: "Tool Chuck Calibration",
      toolNo: "3456789",
      category: "Calibration",
    },
    {
      status: "COMPLETED",
      name: "Torque Wrench",
      toolNo: "3456789",
      category: "Calibration",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tool Performance</h2>
        <div className="flex items-center">
          <div className="h-5 w-5 text-[#ba1717]">⚠️</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm font-medium">Status</div>
        <div className="bg-[#f5f6f7] text-[#5f5f5f] text-xs px-3 py-1 rounded-full">All</div>
      </div>

      <div className="grid gap-3">
        {tools.map((tool, index) => (
          <div
            key={index}
            className={`p-3 rounded-md ${
              tool.status === "OVERDUE" ? "bg-[#ffcccc]" : tool.status === "UPCOMING" ? "bg-[#c2c6eb]" : "bg-[#f5f6f7]"
            }`}
          >
            <div className="text-xs text-[#5f5f5f] mb-1">{tool.status}</div>
            <div className="font-medium">{tool.name}</div>
            <div className="text-sm text-[#5f5f5f]">Tool No: {tool.toolNo}</div>
            <div className="text-sm text-[#5f5f5f]">{tool.category}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
