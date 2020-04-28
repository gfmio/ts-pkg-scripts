export default function resolveStream(stream: NodeJS.ReadWriteStream) {
  return new Promise((resolve) => stream.on("end", resolve));
}
