import "./App.css";
import { useEffect, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { UserInput } from "./UserInput";
import { ImageUploader } from "./ImageUploader";

//https://www.geeksforgeeks.org/lodash-_-omit-method/
//https://react-dnd.github.io/react-dnd/examples/sortable/simple

function App() {
  const [worldScale, setWorldScale] = useState(1.0);
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(0);

  return (
    <div className="App">
      <h1 id="titleMain">
        image registration
        <br />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
          }}
        >
          <span> CANVAS </span> <h2> v.230819 </h2>
        </div>
      </h1>

      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <RegistrationCanvas images={images} worldScale={worldScale} />
        <ImageUploader
          images={images}
          setImages={setImages}
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
        />

        <UserInput
          workingImages={images}
          imageMoving={images.find((image) => selectedImageId == image.id)}
          setImageMoving={(newImageMoving) => {
            setImages((allImages) => {
              const x = allImages.findIndex(
                (image) => selectedImageId == image.id
              );
              return [
                ...allImages.slice(0, x),
                newImageMoving,
                ...allImages.slice(x + 1),
              ];
            });
          }}
          setWorkingImages={(newWorkingImages) => {
            setImages((allImages) => [allImages[0], ...newWorkingImages]);
          }}
          {...{
            worldScale,
            setWorldScale,
          }}
        />
      </div>
    </div>
  );
}

export default App;

//useful links
//https://code-boxx.com/create-save-files-javascript/#:~:text=The%20possible%20ways%20to%20create,offer%20a%20%E2%80%9Csave%20as%E2%80%9D.
