import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

import goldBadgeImg from './gold.png';
import silverBadgeImg from './silver.png';
import bronzeBadgeImg from './bronze.png';


function App() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [ipfsJsonUrl, setIpfsJsonUrl] = useState('');
  const [nftUrl, setNftUrl] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [proofLink, setProofLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 从服务器获取 Ripple 地址和余额
  useEffect(() => {
    console.log('Fetching Ripple address and balance...');
    fetch('http://localhost:3000/ripple-address')
      .then(response => response.json())
      .then(data => setAddress(data.address))
      .catch(error => console.log('Error fetching Ripple address:', error));

    fetch('http://localhost:3000/ripple-balance')
      .then(response => response.json())
      .then(data => setBalance(data.balance))
      .catch(error => console.log('Error fetching Ripple balance:', error));
  }, []);

  const handleMintBadge = (badgeType: any) => {
    setIsMinting(true);
    fetch('http://localhost:3000/mint-badge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ badgeType }),
    })
    .then(response => response.json())
    .then(data => {
      const url = "https://test.bithomp.com/nft/" + data.result.result.meta["nftoken_id"];
      setNftUrl(url);
    })
    .catch(error => console.log('Error minting badge:', error))
    .finally(() => {
      setIsMinting(false); // 完成或发生错误时设置为false
    });
  };

  const handleFileChange = async (event:any) => {
    if (!proofLink) {
      alert('Please enter a Proof Link');
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
  
      const APIKey = '889e5c38c0debb0bd150';
      const APISecret = 'c53488dbb2c840acf1c725c21928c1356b68370f1faaa7115dede7747ad6e70a';
      
      try {
        setIsUploading(true);
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          maxBodyLength: undefined,
          headers: {
            'pinata_api_key': APIKey,
            'pinata_secret_api_key': APISecret
          }
        });
        const url = `ipfs://${res.data.IpfsHash}`;
        setIpfsUrl(url);

        const json = `{
          "schema": "ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU",
          "nftType": "art.v0",
          "name": "#Impactopia",
          "description": "Make a greater impact with Impactopia by sharing insights, connect with others and take actions together. (Bronze)",
          "image": "${url}",
          "attributes": [
              {
                  "trait_type": "Proof link",
                  "value": "${proofLink}"
              }
          ]
      }
        `;
        const FormData = require('form-data');
        const jsonBlob = new Blob([json], { type: 'application/json' });
        const data = new FormData();
        const file = event.target.files[0];
        const fileName = file.name;
        const fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        const newFileName = fileNameWithoutExtension + '.json';
        data.append('file', jsonBlob, newFileName);
        const res1 = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
          headers: {
            'pinata_api_key': APIKey,
            'pinata_secret_api_key': APISecret
          }
         })
        console.log(res1.data.IpfsHash);
        setIpfsJsonUrl(`ipfs://${res1.data.IpfsHash}`);
        setIsUploading(false);
        //alert(res1.data.IpfsHash);


        //alert('Uploaded file URL: ' + url);
      } catch (error) {
        console.log('Error uploading file:', error);
      }
    }
  };  

  return (
    <div className="App">
      <div className="App-nav">
        <div className="App-logo">
          <img src={require('./impic.jpeg')} alt="Logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
        </div>
        <h1 className="App-title">Proof of impact protocal</h1>
      </div>
      <header className="App-header">
        <p className="address">
          <span className="label">Account address:</span>
          <span className="value"> {address}</span>
        </p>
        <p className="address">
          <span className="label">Account Balance:</span>
          <span className="value"> {balance} XRP</span>
        </p>
      </header>
      {isMinting && (
        <div className="modal">
          <p>Minting NFT, please wait...</p>
        </div>
      )}
      {isUploading && (
        <div className="modal">
          <p>Uploading image, please wait...</p>
        </div>
      )}
      {proofLink && (
      <div className="buttons">
      <button onClick={() => handleMintBadge('gold')}>
          <img src={goldBadgeImg} alt="Gold Badge" style={{ width: '50px', height: '50px' }} />
          <div>
          Mint gold badge
          </div>
        </button>
        <button onClick={() => handleMintBadge('silver')}>
          <img src={silverBadgeImg} alt="Silver Badge" style={{ width: '50px', height: '50px' }} />
          <div>
          Mint silver badge
          </div>
        </button>
        <button onClick={() => handleMintBadge('bronze')}>
          <img src={bronzeBadgeImg} alt="Bronze Badge" style={{ width: '50px', height: '50px' }} />
          <div>
          Mint bronze badge
          </div>
        </button>
        </div>)
        }
        {proofLink && (
          <div className="upload-section">
            <input type="file" accept=".png, .jpeg, .jpg" onChange={handleFileChange} />
            {ipfsJsonUrl && (
              <img src={ipfsUrl.replace('ipfs://', 'https://coral-nearby-pigeon-319.mypinata.cloud/ipfs/')} alt="Uploaded" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            )}
          </div>)
        }
        <div className="input-group">
          <input
            type="text"
            value={proofLink}
            onChange={(e) => setProofLink(e.target.value)}
            placeholder="Enter Proof Link"
          />
        </div>        
        <div className="buttons">
        {nftUrl && (
          <button className="view-nft-button" onClick={() => window.open(nftUrl, '_blank')}>
            View NFT
          </button>          
        )}
        <button onClick={() => handleMintBadge(ipfsJsonUrl)} disabled={!ipfsJsonUrl}>
          <div>Mint NFT</div>
        </button>
      </div>
    </div>
  );
}

export default App;
