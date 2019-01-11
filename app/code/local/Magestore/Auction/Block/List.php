<?php

class Magestore_Auction_Block_List extends Mage_Core_Block_Template {

    protected function getListAuction() {
        $store_id = Mage::app()->getStore()->getId();
        $Ids = Mage::helper('auction')->getProductAuctionIds($store_id, true);
        $collection = Mage::getModel('catalog/product')->getCollection()
                ->addAttributeToSelect('small_image')
                ->addFieldToFilter('entity_id', array('in' => $Ids));
        Mage::getSingleton('catalog/product_status')->addVisibleFilterToCollection($collection);
        Mage::getSingleton('catalog/product_visibility')->addVisibleInSearchFilterToCollection($collection);
        return $collection;
    }

    protected function getListFinishedAuction() {
        $collection =Mage::getModel('auction/productauction')->getCollection()
            ->addFieldToFilter('main_table.status', 5)
            ->setOrder('end_date', 'DESC')
            ->setOrder('end_time', 'DESC')
            ->setPagesize(10)
            ->setCurPage(1);
        $collection->getSelect()->joinLeft(array('bid'=>Mage::getSingleton('core/resource')->getTableName('auction_bid')),
            'bid.productauction_id = main_table.productauction_id && bid.status = 5', array('bidder_name' => 'bid.bidder_name', 'bid_price' => 'bid.price'));
        $collection->getSelect()->where('bid.status IS NOT NULL');
        $collection->getSelect()->group('main_table.productauction_id');
        return $collection;
    }

}
