export default function Background() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
    </>
  )
}
