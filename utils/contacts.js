const fs = require("fs");

const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const filePath = "./data/contacts.json";
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

const loadContactData = () => {
  const fileBuffer = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileBuffer);
  return data;
};

const findContactByNama = (contacts, nama) => {
  return contacts.find(
    (contactData) => contactData.nama.toLowerCase() === nama.toLowerCase()
  );
};

const duplicateName = (name) => {
  const contacts = loadContactData();

  return findContactByNama(contacts, name);
};

const writeFile = (contact) => {
  fs.writeFileSync(filePath, JSON.stringify(contact));
};

const addContact = (data) => {
  const contact = loadContactData();
  contact.push(data);
  writeFile(contact);
};

const deleteContact = (nama) => {
  const contacts = loadContactData();

  const filterContacts = contacts.filter(
    (contact) => contact.nama.toLowerCase() !== nama.toLowerCase()
  );
  fs.writeFileSync(filePath, JSON.stringify(filterContacts));
};

module.exports = {
  loadContactData,
  findContactByNama,
  addContact,
  duplicateName,
  deleteContact,
};
