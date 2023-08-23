import "./App.css";
import { useEffect, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { UserInput } from "./UserInput";
import { ImageUploader } from "./ImageUploader";

//https://www.geeksforgeeks.org/lodash-_-omit-method/
//https://react-dnd.github.io/react-dnd/examples/sortable/simple

function App() {
  const [worldScale, setWorldScale] = useState(1.0);
  const [stacks, setStacks] = useState([]);
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
          <span> CANVAS </span> <h2> v.230823 </h2>
        </div>
      </h1>

      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <RegistrationCanvas stacks={stacks} worldScale={worldScale} />

        <ImageUploader
          stacks={stacks}
          setStacks={setStacks}
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
        />

        <UserInput
          workingImages={stacks}
          imageMoving={stacks.find((stack) => selectedImageId == stack.id)}
          setImageMoving={(newImageMoving) => {
            setStacks((allImages) => {
              const x = allImages.findIndex(
                (stack) => selectedImageId == stack.id
              );
              return [
                ...allImages.slice(0, x),
                newImageMoving,
                ...allImages.slice(x + 1),
              ];
            });
          }}
          setWorkingImages={(newWorkingImages) => {
            setStacks((allImages) => [allImages[0], ...newWorkingImages]);
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
