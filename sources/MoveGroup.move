module MyCounterAddr::MoveGroup {

    use StarcoinFramework::Signer;
    use StarcoinFramework::Vector;

    struct Member has store, copy, drop {
        id: u64,
        name: vector<u8>,
        link: vector<u8>
    }

   // single ability is also possible
    struct MoveGroup has key {
        members: vector<Member>
    }

    public fun create_group(account: &signer){
        move_to<MoveGroup>(account, MoveGroup{members: Vector::empty<Member>()});
    }

    public fun addMember(account: &signer,name:vector<u8>, link: vector<u8>) acquires MoveGroup {
        let group = borrow_global_mut<MoveGroup>(Signer::address_of(account));
        let id = Vector::length(&group.members);
        Vector::push_back(&mut group.members, Member{id:id,name:name,link:link});
    }

    public fun updateMemberAtId(account: &signer,id:u64,name:vector<u8>, link: vector<u8>) acquires MoveGroup {
        let group = borrow_global_mut<MoveGroup>(Signer::address_of(account));
        let member = Vector::borrow_mut<Member>(&mut group.members,id);
        member.name = name;
        member.link = link;
    }

    public fun deleteMemberAtId(account: &signer,id:u64) acquires MoveGroup {
        let group = borrow_global_mut<MoveGroup>(Signer::address_of(account));
        Vector::remove(&mut group.members, id);
    }

    public (script) fun init_group(account: signer){
        Self::create_group(&account)
    }

    public(script) fun s_add_member(account: signer, name:vector<u8>, link: vector<u8>) acquires MoveGroup {
        Self::addMember(&account,name, link)
    }

    public(script) fun s_update_member_at_id(account: signer, id:u64,name:vector<u8>, link: vector<u8>) acquires  MoveGroup {
        Self::updateMemberAtId(&account,id,name,link)
    }

    public(script) fun s_delete_member_at_id(account: signer, id:u64) acquires MoveGroup {
        Self::deleteMemberAtId(&account,id)
    }

}