
import "./Editor.css";

function Editor() {
    return <div id='editor'>
 {/* {
          selectedNode ?
            <>
              <div className='node-text-container'>
                <h4>Text</h4>
                <TextAreaInput
                  watch={selectedNode}
                  watchValue={() => selectedNode.val.orig_text}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    if (selectedNode) {
                      selectedNode.val.orig_text = evt.target.value ?? "";
                    }
                  }} />
              </div>

              <div className='node-padding-container'>
                <h4>Padding</h4>
                <div className='input-boxes'>
                  <NumberInput
                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.left.toString()}
                    lable='left'
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.left = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.left;
                    }}
                  />
                  <NumberInput
                    lable='right'
                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.right.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.right = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.right;
                    }}
                  />
                  <NumberInput lable='top'
                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.top.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.top = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.top;
                    }}
                  />
                  <NumberInput lable='bottom'

                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.bottom.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.bottom = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.bottom;
                    }}
                  />
                </div>
              </div>
            </>

            : <></>

        }         */}
    </div>
}

export default Editor;