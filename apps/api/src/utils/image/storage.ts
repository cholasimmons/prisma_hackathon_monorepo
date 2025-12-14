const nameFile = (name: string, bucketName: BucketNames) => `${bucketName}/${name}}.webp`;


enum BucketNames {
  images = "images",
  logos = "logos",
  vehicles = "vehicles",
}

export { nameFile, BucketNames };
